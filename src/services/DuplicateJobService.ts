import { Connection } from '@salesforce/core';
import { CsvReader, CsvRow } from './clients/CsvReader.js';
import { SalesforceRecordClient, DuplicateGroup, JobRecord } from './clients/SalesforceRecordClient.js';

export interface CsvJobParams {
  connection: Connection;
  filePath: string;
  sourceObject: string;
  matchObject: string;
  setMasterForMerge: boolean;
  delimiter: string;
  progressCallback?: (message: string) => void;
}

export interface CsvJobResult {
  status: string;
  jobId?: string;
  groupsProcessed?: number;
  pairsProcessed?: number;
  successCount?: number;
  errorCount?: number;
}

export class DuplicateJobService {
  private static groupCounter = 0;

  constructor(
    private csvReader: CsvReader,
    private recordClient: SalesforceRecordClient
  ) {}

  async createJobFromCsv(params: CsvJobParams): Promise<CsvJobResult> {
    const { connection, filePath, sourceObject, matchObject, setMasterForMerge, delimiter, progressCallback } = params;

    // Reset group counter for each job
    DuplicateJobService.groupCounter = 0;

    progressCallback?.('Start reading csv.');

    // Read and parse CSV
    const csvRows = await this.csvReader.readCsvRows(filePath, delimiter);
    const groups = this.buildGroupsFromCsv(csvRows, sourceObject, matchObject);

    progressCallback?.(`Done reading csv. Parsed ${groups.length} groups.`);

    if (groups.length === 0) {
      return { status: 'completed' };
    }

    progressCallback?.('Inserting Duplicate Check Job into Salesforce.');

    // Create job record
    const jobData: JobRecord = {
      name: `SF CLI: Create Job from CSV File: '${filePath}'`,
      type: 'search',
      sourceObject,
      matchObject,
      status: 'Completed',
      result: 'Manual Duplicate Job inserted via Plauti SF CLI Plugin',
      ended: new Date()
    };

    const jobId = await this.recordClient.createJob(connection, jobData);

    progressCallback?.('Inserting Duplicate Check Groups into Salesforce.');

    // Create groups
    await this.recordClient.createDuplicateGroups(connection, jobId, groups, setMasterForMerge);

    progressCallback?.('Inserting Duplicate Check Pairs into Salesforce.');

    // Create pairs
    const pairResult = await this.recordClient.createDuplicatePairs(connection, jobId, groups);

    progressCallback?.('Done.');

    return {
      status: 'completed',
      jobId,
      groupsProcessed: groups.length,
      pairsProcessed: pairResult.successCount + pairResult.errorCount,
      successCount: pairResult.successCount,
      errorCount: pairResult.errorCount
    };
  }

  private buildGroupsFromCsv(csvRows: CsvRow[], sourceObject: string, matchObject: string): DuplicateGroup[] {
    const groupMap = new Map<string, DuplicateGroup>();

    for (const row of csvRows) {
      const keys = Object.keys(row);
      if (keys.length !== 2) {
        throw new Error('csv file inconsistent: row encountered that does not have 2 columns.');
      }

      const sourceId = Object.values(row)[0];
      const matchId = Object.values(row)[1];

      if (!sourceId || !matchId) {
        continue; // Skip empty rows
      }

      // Skip header row
      if (sourceId.toLowerCase() === 'master') {
        continue;
      }

      if (sourceId === matchId) {
        continue; // Skip self-matches
      }

      if (!sourceId.startsWith(sourceObject)) {
        throw new Error('csv file inconsistent: source id does not start with the same prefix as provided sourceobject flag.');
      }

      if (!matchId.startsWith(matchObject)) {
        throw new Error('csv file inconsistent: match id does not start with the same prefix as provided matchobject flag.');
      }

      if (!groupMap.has(sourceId)) {
        const nextGroupNumber = this.getNextGroupNumber();
        groupMap.set(sourceId, {
          masterId: sourceId,
          groupNumber: nextGroupNumber,
          matchedRecords: new Set<string>()
        });
      }

      groupMap.get(sourceId)?.matchedRecords.add(matchId);
    }

    return Array.from(groupMap.values());
  }

  private getNextGroupNumber(): number {
    DuplicateJobService.groupCounter++;
    return DuplicateJobService.groupCounter;
  }
}