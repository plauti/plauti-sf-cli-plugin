import { Connection } from '@salesforce/core';

export interface DuplicateGroup {
  masterId: string;
  groupNumber: number;
  matchedRecords: Set<string>;
  groupId?: string;
}

export interface DuplicatePair {
  jobId: string;
  groupId: string;
  matchObject: string;
  sourceObject: string;
  score: number;
}

export interface BulkResult {
  successCount: number;
  errorCount: number;
}

export interface JobRecord {
  name: string;
  type: string;
  sourceObject: string;
  matchObject: string;
  status: string;
  result: string;
  ended: Date;
}

export interface SalesforceRecordClient {
  createJob(connection: Connection, jobData: JobRecord): Promise<string>;
  createDuplicateGroups(connection: Connection, jobId: string, groups: DuplicateGroup[], setMasterForMerge: boolean): Promise<void>;
  createDuplicatePairs(connection: Connection, jobId: string, groups: DuplicateGroup[]): Promise<BulkResult>;
}

export class SalesforceRecordClientImpl implements SalesforceRecordClient {
  private static readonly CHUNK_SIZE = 200;
  private static readonly DELAY_MS = 5000;

  async createJob(connection: Connection, jobData: JobRecord): Promise<string> {
    const dcJobSobject: Record<string, unknown> = {
      dupcheck__name__c: jobData.name,
      dupcheck__type__c: jobData.type,
      dupcheck__sourceobject__c: jobData.sourceObject,
      dupcheck__matchobject__c: jobData.matchObject,
      dupcheck__status__c: jobData.status,
      dupcheck__result__c: jobData.result,
      dupcheck__Ended__c: jobData.ended
    };

    const dcJob = await connection.sobject('dupcheck__dcJob__c').create(dcJobSobject) as { id: string };
    return dcJob.id;
  }

  async createDuplicateGroups(connection: Connection, jobId: string, groups: DuplicateGroup[], setMasterForMerge: boolean): Promise<void> {
    const groupList: Record<string, unknown>[] = [];

    for (const group of groups) {
      const dcGroupSobject: Record<string, unknown> = {
        dupcheck__dcJob__c: jobId,
        dupcheck__group__c: group.groupNumber
      };
      
      if (setMasterForMerge) {
        dcGroupSobject['dupcheck__MasterRecord__c'] = group.masterId;
      }

      groupList.push(dcGroupSobject);
    }

    // Process in chunks
    for (let i = 0; i < groupList.length; i += SalesforceRecordClientImpl.CHUNK_SIZE) {
      const currentGroupListChunk = groupList.slice(i, i + SalesforceRecordClientImpl.CHUNK_SIZE);
      
      const createdGroups = await connection.sobject('dupcheck__dcGroup__c').create(currentGroupListChunk) as Array<{ id: string }>;
      
      // Update group IDs
      for (let createdGroupIndex = 0; createdGroupIndex < createdGroups.length; createdGroupIndex++) {
        const groupSobject = currentGroupListChunk[createdGroupIndex];
        const groupNumber = groupSobject!['dupcheck__group__c'] as number;
        const matchingGroup = groups.find(g => g.groupNumber === groupNumber);
        
        if (matchingGroup) {
          matchingGroup.groupId = createdGroups[createdGroupIndex]!.id;
        }
      }
    }
  }

  async createDuplicatePairs(connection: Connection, jobId: string, groups: DuplicateGroup[]): Promise<BulkResult> {
    const dcPairList: Record<string, unknown>[] = [];
    
    // Build pairs list
    for (const group of groups) {
      if (!group.groupId) {
        throw new Error('Encountered a group that did not receive a Salesforce ID');
      }
      
      for (const matchId of group.matchedRecords) {
        dcPairList.push({
          dupcheck__dcJob__c: jobId,
          dupcheck__dcGroup__c: group.groupId,
          dupcheck__MatchObject__c: matchId,
          dupcheck__SourceObject__c: group.masterId,
          dupcheck__Score__c: 100
        });
      }
    }

    let successCount = 0;
    let errorCount = 0;

    // Process in chunks with delay
    for (let i = 0; i < dcPairList.length; i += SalesforceRecordClientImpl.CHUNK_SIZE) {
      const currentPairListChunk = dcPairList.slice(i, i + SalesforceRecordClientImpl.CHUNK_SIZE);
      
      try {
        const createdPairs = await connection.sobject('dupcheck__dc3Duplicate__c').create(currentPairListChunk) as Array<{ success: boolean }>;
        
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

      // Add delay between chunks
      if (i + SalesforceRecordClientImpl.CHUNK_SIZE < dcPairList.length) {
        await this.delay(SalesforceRecordClientImpl.DELAY_MS);
      }
    }

    return { successCount, errorCount };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timeoutId = globalThis.setTimeout(resolve, ms);
      return timeoutId;
    });
  }
}