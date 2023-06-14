import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { RecordResult } from 'jsforce';
import * as parse from 'csv-parse';
import * as fs from 'fs';

Messages.importMessagesDirectory(__dirname);

const delay = ms => new Promise(res => setTimeout(res, ms));

export class DcGroup {
  private masterId: string;
  private groupId: string;
  private groupNumber: number;
  private matchedRecords: Set<string>;

  constructor(masterId :string, groupNumber :number) {
    this.masterId = masterId;
    this.matchedRecords = new Set<string>();
    this.groupNumber = groupNumber;
  }

  public addMatchedRecord(matchId :string) {
    this.matchedRecords.add(matchId);
  }

  public getGroupNumber() {
    return this.groupNumber;
  }

  public setGroupId(groupIdInSalesforce :string) {
    this.groupId = groupIdInSalesforce;
  }

  public getMasterId() {
    return this.masterId;
  }

  public getGroupId() {
    return this.groupId;
  }

  public getMatchedRecords() {
    return this.matchedRecords;
  }

}

export class DcPair {
  private sourceId: string;
  private matchId: string;
}

export default class CsvTojob extends SfdxCommand {

  private static _groupCounter :number = 0;
  private static _sfNamespace :string = 'dupcheck'

  public static description = 'Create A Plauti Duplicate Check Job based on a CSV File';

  public static examples = [
    '$ sfdx plauti:duplicatecheck:csv:tojob --targetusername myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001',
    '$ sfdx plauti:duplicatecheck:csv:tojob --targetusername myOrg@example.com --file ./myFirstJob.csv --sourceobject 001 --matchobject 001 --setmasterformerge'
  ];
  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

protected static flagsConfig: FlagsConfig = {
  file: flags.filepath({ description: 'Csv file path', required: true }),
  sourceobject: flags.string({ description: 'Source Object Prefix', required: true }),
  matchobject: flags.string({ description: 'Match Object Prefix', required: true }),
  setmasterformerge: flags.boolean({ description: 'Set Master record for Merge', default: false }),
  delimiter: flags.string({ description: 'Csv Delimiter', default: ','})
};

private _getNextGroupNumber() : number {
  CsvTojob._groupCounter ++;
  return CsvTojob._groupCounter;
}

public async run(): Promise<AnyJson> {

  const sfConnection = this.org.getConnection();
  const groupMap = new Map<string, DcGroup>();
  const masterGroupMap = new Map<number, string>();

  this.ux.cli.info(`Start reading csv.`)
  fs.createReadStream(this.flags.file, 'utf8')
    .pipe(parse({ delimiter: this.flags.delimiter, from_line: 2 }))
    .on("data", row => {
      if (2 !== row.length) {
        throw new SfdxError('csv file inconsistent: row encountered that does not have 2 columns.');
      }

      const sourceId = row[0];
      const matchId = row[1];

      if (sourceId == matchId) {
        return;
      }

      if (!sourceId.startsWith(this.flags.sourceobject)) {
        throw new SfdxError('csv file inconsistent: source id does not start with the same prefix as provided sourceobject flag.');
      }

      if (!matchId.startsWith(this.flags.matchobject)) {
        throw new SfdxError('csv file inconsistent: match id does not start with the same prefix as provided matchobject flag.');
      }

      if (!groupMap.has(sourceId)) {
        const nextGroupNumber = this._getNextGroupNumber();
        groupMap.set(sourceId, new DcGroup(sourceId, nextGroupNumber));
        masterGroupMap.set(nextGroupNumber, sourceId);
      }

      groupMap.get(sourceId).addMatchedRecord(matchId);
    }).on('end', async () => {
      this.ux.cli.info(`Done reading csv. Parsed ${groupMap.size} groups.`);

      if (0 === groupMap.size) {
        return;
      }

      this.ux.cli.info(`Inserting Duplicate Check Job into Salesforce.`);

      const dcJobSobject :any = {
        'dupcheck__name__c': `SFDX: Create Job from CSV File: '${this.flags.file}'`,
        'dupcheck__type__c': 'search',
        'dupcheck__sourceobject__c': this.flags.sourceobject,
        'dupcheck__status__c': 'completed',
        'dupcheck__result__c': 'Manual Duplicate Job inserted via Plauti SFDX Plugin'
      }

      if (this.flags.sourceobject !== this.flags.matchobject) {
        dcJobSobject['dupcheck__matchobject__c'] = this.flags.matchobject;
      }

      let dcJob :object;
      try {
        dcJob = await sfConnection.sobject('dupcheck__dcJob__c').create(dcJobSobject);
        this.ux.cli.info(`Inserted Duplicate Check Job into Salesforce: ${dcJob['id']}.`);
      } catch (e) {
        throw new SfdxError(`Could not insert job into Salesforce: ${e}`);
      }

      let largestGroupSize :number = 0;
      const groupList :Array<object> = [];

      for (const [_, group] of groupMap) {
        this.ux.cli.info(`Processing Group: ${JSON.stringify(group)}`);
        const dcGroupSobject :any = {
          'dupcheck__dcJob__c': dcJob['id'],
          'dupcheck__group__c': group.getGroupNumber()
        }
        if (this.flags.setmasterformerge) {
          dcGroupSobject['dupcheck__MasterRecord__c'] = group.getMasterId();
        }

        groupList.push(dcGroupSobject);

        const groupSize = group.getMatchedRecords().size;
        if (groupSize > largestGroupSize) {
          largestGroupSize = groupSize;
        }
      }
      this.ux.cli.info(`Inserting Duplicate Check Groups into Salesforce.`);

      // chunk grouplist into chunks of 200 groups and push to sf
      const chunkSize = 200;
      for (let i = 0; i < groupList.length; i += chunkSize) {
        const currentGroupListChunk :Array<object> = groupList.slice(i, i+chunkSize);
        try {
          const createdGroups = await sfConnection.sobject('dupcheck__dcGroup__c').create(currentGroupListChunk);
          for(let createdGroupIndex = 0; createdGroupIndex < createdGroups.length; createdGroupIndex++) {
            const group = currentGroupListChunk[createdGroupIndex];
            const masterId = masterGroupMap.get(group['dupcheck__group__c'])
            groupMap.get(masterId).setGroupId(createdGroups[createdGroupIndex]['id'])
          }
        } catch (e) {
          throw new SfdxError(`Inserting groups failed: ${e}`);
        }
      }

      // prepare dc duplicate pairs to be inserted into sf
      const dcPairList = [];
      let successCount = 0;
      let errorCount = 0;
      for (const [_, group] of groupMap) {
        for (const matchId of group.getMatchedRecords()) {
          if (!group.getGroupId()) {
            throw new SfdxError(`Encountered a group that did not receive a Salesforce ID`);
          }
          dcPairList.push({
            'dupcheck__dcJob__c': dcJob['id'],
            'dupcheck__dcGroup__c': group.getGroupId(),
            'dupcheck__MatchObject__c': matchId,
            'dupcheck__SourceObject__c': group.getMasterId(),
            'dupcheck__Score__c': 100,
          })
        }
      }

      this.ux.cli.info(`Inserting Duplicate Check Pairs into Salesforce.`);

      // chunk the dc duplicate pairs into chuncks of 200 and push to sf
      for (let i = 0; i < dcPairList.length; i += chunkSize) {
        const currentPairListChunk :Array<object> = dcPairList.slice(i, i+chunkSize);
        try {
          const createdPairs = await sfConnection.sobject('dupcheck__dc3Duplicate__c').create(currentPairListChunk);
          createdPairs.forEach((createdPair) => {
            if (createdPair.success) {
              successCount++;
            } else {
              errorCount ++;
            }
          })
        } catch (e) {
          // fail silently
        }
        this.ux.cli.info(`Inserted ${successCount} pairs, encountered ${errorCount} errors.`);
        this.ux.cli.info(`Sleeping for 5 seconds.`);
        await delay(5000);

      }


      this.ux.cli.info(`Done.`);
    });

  return '{}';
}

}
