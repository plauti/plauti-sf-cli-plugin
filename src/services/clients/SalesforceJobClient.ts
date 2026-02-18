import { Connection } from '@salesforce/core';

export interface JobInfo {
  Status?: string;
  ExtendedStatus: string;
  jobInfo?: unknown;
}

export interface SubmitJobResponse {
  ok?: boolean;
  jobId?: string;
  errorMessage: string;
}

export interface PollJobResponse {
  ok?: boolean;
  errorMessage: string;
  jobInfo?: JobInfo;
  warnings?: unknown;
}

export interface SalesforceJobClient {
  submitExportJob(connection: Connection): Promise<string>;
  submitImportJob(connection: Connection, config: Record<string, unknown>): Promise<string>;
  pollJobStatus(connection: Connection, jobId: string): Promise<PollJobResponse | null>;
  pollImportJobStatus(connection: Connection, jobId: string): Promise<PollJobResponse | null>;
  downloadJobResult(connection: Connection, jobId: string): Promise<string>;
}

export class SalesforceJobClientImpl implements SalesforceJobClient {
  private static readonly EXPORT_CONFIG_JOB_SUBMIT = '/dupcheck/dc3Api/admin/export-config';
  private static readonly EXPORT_CONFIG_JOB_STAT_PATH = '/dupcheck/dc3Api/admin/export-config-job-stat';
  private static readonly EXPORT_CONFIG_DOWNLOAD = '/dupcheck/dc3Api/admin/export-config-download';
  private static readonly IMPORT_CONFIG_JOB_SUBMIT = '/dupcheck/dc3Api/admin/import-config';
  private static readonly IMPORT_CONFIG_JOB_STAT_PATH = '/dupcheck/dc3Api/admin/import-config-job-stat';

  async submitExportJob(connection: Connection): Promise<string> {
    const body: SubmitJobResponse = await connection.apex.post(
      SalesforceJobClientImpl.EXPORT_CONFIG_JOB_SUBMIT, 
      {}
    );

    if (!body.ok) {
      throw new Error(body.errorMessage);
    }
    return body.jobId!;
  }

  async submitImportJob(connection: Connection, config: Record<string, unknown>): Promise<string> {
    const response: { jobId: string } = await connection.apex.post(
      SalesforceJobClientImpl.IMPORT_CONFIG_JOB_SUBMIT, 
      config, 
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    );
    return response?.jobId;
  }

  async pollJobStatus(connection: Connection, jobId: string): Promise<PollJobResponse | null> {
    const input = { jobId };
    const body = await connection.apex.post(
      SalesforceJobClientImpl.EXPORT_CONFIG_JOB_STAT_PATH, 
      input
    ) as PollJobResponse & { jobInfo: { Status: string; ExtendedStatus: string } };

    if (!body.ok) {
      throw new Error(body.errorMessage);
    }

    switch (body.jobInfo?.Status) {
      case 'Completed':
        return body;
      case 'Failed':
        throw new Error(body.jobInfo.ExtendedStatus);
      case 'Aborted':
        throw new Error(body.jobInfo.ExtendedStatus);
      default:
        return null;
    }
  }

  async pollImportJobStatus(connection: Connection, jobId: string): Promise<PollJobResponse | null> {
    const input = { jobId };
    const body = await connection.apex.post(
      SalesforceJobClientImpl.IMPORT_CONFIG_JOB_STAT_PATH, 
      input
    ) as PollJobResponse & { jobInfo: { Status: string; ExtendedStatus: string } };

    if (!body.ok) {
      throw new Error(body.errorMessage);
    }

    switch (body.jobInfo?.Status) {
      case 'Completed':
        return body;
      case 'Failed':
        throw new Error(body.jobInfo.ExtendedStatus);
      case 'Aborted':
        throw new Error(body.jobInfo.ExtendedStatus);
      default:
        return null;
    }
  }

  async downloadJobResult(connection: Connection, jobId: string): Promise<string> {
    const input = { jobId };
    const body = await connection.apex.post(
      SalesforceJobClientImpl.EXPORT_CONFIG_DOWNLOAD, 
      input
    );
    return String(body);
  }
}