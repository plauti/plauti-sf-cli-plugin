import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Connection } from '@salesforce/core';
import * as fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';

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
  warnings?: unknown;
}

export interface JobInfo {
  Status?: string;
  ExtendedStatus: string;
  jobInfo?: unknown;
}

export default class ImportConfig extends SfCommand<{ ok: string; warnings?: unknown }> {
  public static readonly summary = 'Import Plauti Deduplicate configuration';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json --poll-interval 10',
    '$ sf plauti:deduplicate:config:import --target-org myOrg@example.com --file ./export/test_config.json'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    file: Flags.file({
      description: 'File path',
      required: true,
      exists: true
    }),
    'poll-interval': Flags.integer({
      description: 'Poll interval in seconds',
      required: false,
      default: 3
    }),
    json: Flags.boolean({
      description: 'Format output as json',
      default: false
    }),
    verbose: Flags.boolean({
      description: 'Show verbose output including job IDs and file paths',
      default: false
    })
  };

  public static readonly requiresProject = false;

  private static readonly IMPORT_CONFIG_JOB_SUBMIT = '/dupcheck/dc3Api/admin/import-config';
  private static readonly IMPORT_CONFIG_JOB_STAT_PATH = '/dupcheck/dc3Api/admin/import-config-job-stat';

  private logger!: LoggingUtility;

  public async run(): Promise<{ ok: string; warnings?: unknown }> {
    const { flags } = await this.parse(ImportConfig);
    
    this.logger = createLogger(flags);
    const spinnerLogger = this.logger.createSpinnerLogger();

    const targetOrg = flags['target-org'];
    const conn = (targetOrg as any).getConnection();
    const filePath = flags.file as string;

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Importing configuration file');
    }

    const stats = fs.statSync(filePath);

    if (!stats.isFile()) {
      this.throwError('File not found: ' + filePath);
    } else if (stats.isDirectory()) {
      this.throwError('Cannot import directory: ' + filePath);
    }

    const jobId = await this.uploadFile(conn, filePath);
    this.logger.logJobDetails('jobId', jobId);

    if (jobId == null) {
      this.throwError('Failed to upload file, no job id.');
    }

    let pollResponse: PollJobResponse | null = await this.pollJob(conn, jobId);

    while (!pollResponse) {
      await this.sleep((flags['poll-interval'] as number) * 1000);
      pollResponse = await this.pollJob(conn, jobId);
    }

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.stop('Done!');
    }

    if (flags.json) {
      this.logger.json({ ok: 'true', warnings: pollResponse.warnings });
    }

    return {
      ok: 'true',
      warnings: pollResponse.warnings
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  private async pollJob(conn: Connection, jobId: string): Promise<PollJobResponse | null> {
    try {
      const input = { jobId };
      const body: { ok: boolean; errorMessage: string; jobInfo: { Status: string; ExtendedStatus: string } } = await conn.apex.post(ImportConfig.IMPORT_CONFIG_JOB_STAT_PATH, input);
      
      if (!body.ok) {
        this.throwError(body.errorMessage);
      }

      switch (body.jobInfo.Status) {
        case 'Completed':
          return body as PollJobResponse;
        case 'Failed':
          this.throwError(body.jobInfo.ExtendedStatus);
          break;
        case 'Aborted':
          this.throwError(body.jobInfo.ExtendedStatus);
          break;
        default:
          break;
      }

      return null;
    } catch (error) {
      this.log('Polling error', error);
      return null;
    }
  }

  private async uploadFile(conn: Connection, filePath: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileAsJson = JSON.parse(fileContent);

    try {
      const response: { jobId: string } = await conn.apex.post(ImportConfig.IMPORT_CONFIG_JOB_SUBMIT, fileAsJson, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      return response?.jobId;
    } catch (error) {
      this.throwError(`${error}`);
      throw error;
    }
  }

  private throwError(message: string): never {
    const spinnerLogger = this.logger.createSpinnerLogger();
    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.stop('Failed!');
    }
    throw new Error(formatError('import configuration file', message));
  }
}