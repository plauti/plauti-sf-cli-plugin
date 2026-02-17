import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Connection } from '@salesforce/core';
import * as fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export interface SubmitJobResponse {
  ok?: boolean;
  jobId?: string;
  errorMessage: string;
}

export interface PollJobResponse {
  ok?: boolean;
  errorMessage: string;
  jobInfo?: JobInfo;
}

export interface JobInfo {
  Status?: string;
  ExtendedStatus: string;
  jobInfo?: unknown;
}

export default class ExportConfig extends SfCommand<{ path: string }> {
  public static readonly summary = 'Export Plauti Deduplicate configuration';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json --poll-interval 10',
    '$ sf plauti:deduplicate:config:export --target-org myOrg@example.com --file ./export/test_config.json'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    file: Flags.file({
      description: 'Export file path and name',
      required: true
    }),
    'poll-interval': Flags.integer({
      description: 'Poll interval in seconds',
      required: false,
      default: 3
    })
  };

  public static readonly requiresProject = false;

  private static readonly EXPORT_CONFIG_JOB_SUBMIT = '/dupcheck/dc3Api/admin/export-config';
  private static readonly EXPORT_CONFIG_JOB_STAT_PATH = '/dupcheck/dc3Api/admin/export-config-job-stat';
  private static readonly EXPORT_CONFIG_DOWNLOAD = '/dupcheck/dc3Api/admin/export-config-download';

  public async run(): Promise<{ path: string }> {
    const { flags } = await this.parse(ExportConfig);
    
    const targetOrg = flags['target-org'];
    const conn = (targetOrg as any).getConnection();
    const filePath = flags.file as string;

    this.spinner.start('Downloading export file');

    const jobId = await this.submitJob(conn);
    this.log('Job id: ' + jobId);

    if (jobId == null) {
      this.throwError('Failed to upload file, no job id.');
    }

    let pollDone = await this.pollJob(conn, jobId);
    
    while (!pollDone) {
      await this.sleep((flags['poll-interval'] as number) * 1000);
      pollDone = await this.pollJob(conn, jobId);
    }

    const fileContent = await this.downloadFile(conn, jobId);
    this.spinner.stop('Done!');

    await fs.writeFile(filePath, fileContent, {
      encoding: 'utf-8',
      flag: 'w'
    });
    this.log('File: ' + filePath);

    return {
      path: filePath
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  private async submitJob(conn: Connection): Promise<string> {
    try {
      const body: SubmitJobResponse = await conn.apex.post(ExportConfig.EXPORT_CONFIG_JOB_SUBMIT, {});

      if (!body.ok) {
        this.throwError(body.errorMessage);
      }
      return body.jobId!;
    } catch (error) {
      this.throwError(`${error}`);
      throw error;
    }
  }

  private async pollJob(conn: Connection, jobId: string): Promise<boolean> {
    try {
      const input = { jobId };
      const body: PollJobResponse = await conn.apex.post(ExportConfig.EXPORT_CONFIG_JOB_STAT_PATH, input);

      if (!body.ok) {
        this.throwError(body.errorMessage);
      }

      switch (body.jobInfo?.Status) {
        case 'Completed':
          return true;
        case 'Failed':
          this.throwError(body.jobInfo.ExtendedStatus);
          break;
        case 'Aborted':
          this.throwError(body.jobInfo.ExtendedStatus);
          break;
        default:
          break;
      }
      return false;
    } catch (error) {
      this.throwError(`${error}`);
      throw error;
    }
  }

  private async downloadFile(conn: Connection, jobId: string): Promise<string> {
    const input = { jobId };
    const body = await conn.apex.post(ExportConfig.EXPORT_CONFIG_DOWNLOAD, input);
    return String(body);
  }

  private throwError(message: string): never {
    this.spinner.stop('Failed!');
    throw new Error('Failed to export configuration file. ' + (message ? message : ''));
  }
}