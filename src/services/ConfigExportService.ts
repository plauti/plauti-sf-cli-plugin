import { Connection } from '@salesforce/core';
import { SalesforceJobClient, PollJobResponse } from './clients/SalesforceJobClient.js';
import { FileSystemClient } from './clients/FileSystemClient.js';

export interface ExportParams {
  connection: Connection;
  filePath: string;
  pollInterval: number;
}

export interface ExportResult {
  status: string;
  filePath?: string;
  jobId?: string;
}

export class ConfigExportService {
  constructor(
    private jobClient: SalesforceJobClient,
    private fileSystem: FileSystemClient
  ) {}

  async exportConfig(params: ExportParams): Promise<ExportResult> {
    const { connection, filePath, pollInterval } = params;

    // Submit export job
    const jobId = await this.jobClient.submitExportJob(connection);

    // Poll for completion
    let result: PollJobResponse | null = null;
    while (!result) {
      await this.delay(pollInterval * 1000);
      result = await this.jobClient.pollJobStatus(connection, jobId);
    }

    // Download and save result
    const configContent = await this.jobClient.downloadJobResult(connection, jobId);
    await this.fileSystem.writeFile(filePath, configContent);

    return {
      status: 'completed',
      filePath,
      jobId
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timeoutId = globalThis.setTimeout(resolve, ms);
      return timeoutId;
    });
  }
}