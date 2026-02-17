import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import * as fs from 'fs';
import * as readline from 'readline';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

const delay = (ms: number): Promise<void> => new Promise(res => globalThis.setTimeout(res, ms));

export class DcGroup {
  private masterId: string;
  private groupId: string = '';
  private groupNumber: number;
  private matchedRecords: Set<string>;

  constructor(masterId: string, groupNumber: number) {
    this.masterId = masterId;
    this.matchedRecords = new Set<string>();
    this.groupNumber = groupNumber;
  }

  public addMatchedRecord(matchId: string): void {
    this.matchedRecords.add(matchId);
  }

  public getGroupNumber(): number {
    return this.groupNumber;
  }

  public setGroupId(groupIdInSalesforce: string): void {
    this.groupId = groupIdInSalesforce;
  }

  public getMasterId(): string {
    return this.masterId;
  }

  public getGroupId(): string {
    return this.groupId;
  }

  public getMatchedRecords(): Set<string> {
    return this.matchedRecords;
  }
}

export default class CsvTojob extends SfCommand<string> {
  public static readonly summary = 'Create A Plauti Deduplicate Job based on a CSV File';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001 --set-master-for-merge',
    '$ sf plauti:deduplicate:csv:tojob --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    file: Flags.file({ 
      description: 'Csv file path', 
      required: true,
      exists: true 
    }),
    'source-object': Flags.string({ 
      description: 'Source Object Prefix', 
      required: true 
    }),
    'match-object': Flags.string({ 
      description: 'Match Object Prefix', 
      required: true 
    }),
    'set-master-for-merge': Flags.boolean({ 
      description: 'Set Master record for Merge', 
      default: false 
    }),
    delimiter: Flags.string({ 
      description: 'Csv Delimiter', 
      default: ',' 
    })
  };

  public static readonly requiresProject = false;

  private static groupCounter: number = 0;

  public async run(): Promise<string> {
    const { flags } = await this.parse(CsvTojob);
    
    const targetOrg = flags['target-org'];
    const conn = (targetOrg as any).getConnection();
    const groupMap = new Map<string, DcGroup>();
    const masterGroupMap = new Map<number, string>();

    this.log('Start reading csv.');
    const fileStream = fs.createReadStream(flags.file as string);

    const linereader = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    return new Promise((resolve, reject) => {
      linereader.on('line', row => {
        const rowData: string[] = row.trim().split(flags.delimiter as string);

        if (2 !== rowData.length) {
          reject(new Error('csv file inconsistent: row encountered that does not have 2 columns.'));
          return;
        }

        if ('master' === rowData[0]?.toLowerCase()) {
          return; // skip header row
        }

        const sourceId = rowData[0]!;
        const matchId = rowData[1]!;

        if (sourceId === matchId) {
          return;
        }

        if (!sourceId.startsWith(flags['source-object'] as string)) {
          reject(new Error('csv file inconsistent: source id does not start with the same prefix as provided sourceobject flag.'));
          return;
        }

        if (!matchId.startsWith(flags['match-object'] as string)) {
          reject(new Error('csv file inconsistent: match id does not start with the same prefix as provided matchobject flag.'));
          return;
        }

        if (!groupMap.has(sourceId)) {
          const nextGroupNumber = this.getNextGroupNumber();
          groupMap.set(sourceId, new DcGroup(sourceId, nextGroupNumber));
          masterGroupMap.set(nextGroupNumber, sourceId);
        }

        groupMap.get(sourceId)?.addMatchedRecord(matchId);
      }).on('close', async () => {
        try {
          this.log(`Done reading csv. Parsed ${groupMap.size} groups.`);

          if (0 === groupMap.size) {
            resolve('{}');
            return;
          }

          this.log('Inserting Duplicate Check Job into Salesforce.');

          const dcJobSobject: Record<string, unknown> = {
            dupcheck__name__c: `SF CLI: Create Job from CSV File: '${flags.file}'`,
            dupcheck__type__c: 'search',
            dupcheck__sourceobject__c: flags['source-object'],
            dupcheck__matchobject__c: flags['match-object'],
            dupcheck__status__c: 'Completed',
            dupcheck__result__c: 'Manual Duplicate Job inserted via Plauti SF CLI Plugin',
            dupcheck__Ended__c: new Date()
          };

          let dcJob: { id: string };
          try {
            dcJob = await conn.sobject('dupcheck__dcJob__c').create(dcJobSobject) as { id: string };
            this.log(`Inserted Duplicate Check Job into Salesforce: ${dcJob.id}.`);
          } catch (error) {
            reject(new Error(`Could not insert job into Salesforce: ${error}`));
            return;
          }

          let largestGroupSize: number = 0;
          const groupList: Record<string, unknown>[] = [];

          for (const [, group] of groupMap) {
            this.log(`Processing Group: ${JSON.stringify(group)}`);
            const dcGroupSobject: Record<string, unknown> = {
              dupcheck__dcJob__c: dcJob.id,
              dupcheck__group__c: group.getGroupNumber()
            };
            if (flags['set-master-for-merge']) {
              dcGroupSobject['dupcheck__MasterRecord__c'] = group.getMasterId();
            }

            groupList.push(dcGroupSobject);

            const groupSize = group.getMatchedRecords().size;
            if (groupSize > largestGroupSize) {
              largestGroupSize = groupSize;
            }
          }
          this.log('Inserting Duplicate Check Groups into Salesforce.');

          // chunk grouplist into chunks of 200 groups and push to sf
          const chunkSize = 200;
          for (let i = 0; i < groupList.length; i += chunkSize) {
            const currentGroupListChunk: Record<string, unknown>[] = groupList.slice(i, i + chunkSize);
            try {
              const createdGroups = await conn.sobject('dupcheck__dcGroup__c').create(currentGroupListChunk) as Array<{ id: string }>;
              for (let createdGroupIndex = 0; createdGroupIndex < createdGroups.length; createdGroupIndex++) {
                const group = currentGroupListChunk[createdGroupIndex]!;
                const masterId = masterGroupMap.get(group['dupcheck__group__c'] as number);
                if (masterId) {
                  groupMap.get(masterId)?.setGroupId(createdGroups[createdGroupIndex]!.id);
                }
              }
            } catch (error) {
              reject(new Error(`Inserting groups failed: ${error}`));
              return;
            }
          }

          // prepare dc duplicate pairs to be inserted into sf
          const dcPairList: Record<string, unknown>[] = [];
          let successCount = 0;
          let errorCount = 0;
          for (const [, group] of groupMap) {
            for (const matchId of group.getMatchedRecords()) {
              if (!group.getGroupId()) {
                reject(new Error('Encountered a group that did not receive a Salesforce ID'));
                return;
              }
              dcPairList.push({
                dupcheck__dcJob__c: dcJob.id,
                dupcheck__dcGroup__c: group.getGroupId(),
                dupcheck__MatchObject__c: matchId,
                dupcheck__SourceObject__c: group.getMasterId(),
                dupcheck__Score__c: 100
              });
            }
          }

          this.log('Inserting Duplicate Check Pairs into Salesforce.');

          // chunk the dc duplicate pairs into chunks of 200 and push to sf
          for (let i = 0; i < dcPairList.length; i += chunkSize) {
            const currentPairListChunk: Record<string, unknown>[] = dcPairList.slice(i, i + chunkSize);
            try {
              const createdPairs = await conn.sobject('dupcheck__dc3Duplicate__c').create(currentPairListChunk) as Array<{ success: boolean }>;
              createdPairs.forEach(createdPair => {
                if (createdPair.success) {
                  successCount++;
                } else {
                  errorCount++;
                }
              });
            } catch {
              errorCount += currentPairListChunk.length;
            }
            this.log(`Inserted ${successCount} pairs, encountered ${errorCount} errors.`);
            this.log('Sleeping for 5 seconds.');
            await delay(5000);
          }

          this.log('Done.');
          resolve('{}');
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private getNextGroupNumber(): number {
    CsvTojob.groupCounter++;
    return CsvTojob.groupCounter;
  }
}