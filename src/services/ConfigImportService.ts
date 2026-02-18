import { Connection } from '@salesforce/core';
import { SalesforceJobClient, PollJobResponse } from './clients/SalesforceJobClient.js';
import { FileSystemClient } from './clients/FileSystemClient.js';

export interface ImportParams {
  connection: Connection;
  filePath: string;
  pollInterval: number;
}

export interface ImportResult {
  status: string;
  jobId?: string;
}

export class ConfigImportService {
  constructor(
    private jobClient: SalesforceJobClient,
    private fileSystem: FileSystemClient
  ) {}

  async importConfig(params: ImportParams): Promise<ImportResult> {
    const { connection, filePath, pollInterval } = params;

    // Validate and read config file
    const fileStats = await this.fileSystem.validateFile(filePath);
    if (!fileStats.exists || !fileStats.isFile) {
      throw new Error(`Config file not found or invalid: ${filePath}`);
    }

    const configContent = await this.fileSystem.readFile(filePath);
    let config: Record<string, unknown>;
    
    try {
      config = JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Invalid JSON in config file: ${error}`);
    }

    // Submit import job
    const jobId = await this.jobClient.submitImportJob(connection, config);

    // Poll for completion
    let result: PollJobResponse | null = null;
    while (!result) {
      await this.delay(pollInterval * 1000);
      result = await this.jobClient.pollImportJobStatus(connection, jobId);
    }

    return {
      status: 'completed',
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