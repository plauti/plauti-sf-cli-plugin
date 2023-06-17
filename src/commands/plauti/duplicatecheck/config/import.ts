import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

Messages.importMessagesDirectory(__dirname);

export interface SubmitJobResponse {
  ok?: boolean;
  jobId?: object;
  errorMessage: string;
}

export interface PollJobResponse {
  ok?: boolean;
  errorMessage: string;
  jobInfo?: JobInfo;
  warnings?: AnyJson;
}

export interface JobInfo {
  Status?: string;
  ExtendedStatus: string;
  jobInfo?: AnyJson;
}

export default class ImportConfig extends SfdxCommand {

  public static description = 'Import Plauti Duplicate Check configuration';

  public static examples = [
    '$ sfdx plauti:duplicatecheck:config:import --targetusername myOrg@example.com --file ./export/test_config.json',
    '$ sfdx plauti:duplicatecheck:config:import --targetusername myOrg@example.com --file ./export/test_config.json --pollinterval 10'
  ];
  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  protected static flagsConfig: FlagsConfig = {
    file: flags.filepath({
      description: 'File path',
      required: true
    }),
    pollinterval: flags.integer({
      description: 'Poll interval in seconds',
      required: false,
      default: 3
    })
  };

  private static IMPORT_CONFIG_JOB_SUBMIT = '/dupcheck/dc3Api/admin/import-config';
  private static IMPORT_CONFIG_JOB_STAT_PATH = '/dupcheck/dc3Api/admin/import-config-job-stat';

  public async run(): Promise<AnyJson> {

    this.ux.startSpinner('Importing configuration file');
    const conn = this.org.getConnection();
    const ux = this.ux;

    const filePath = this.flags.file;
    const stats = fs.statSync(filePath);

    if (!stats.isFile) {
      throwError('File not found: ' + filePath);
    } else if (stats.isDirectory()) {
      throwError('Can not import directory: ' + filePath);
    }

    const jobId = await uploadFile();
    this.ux.log('Job Id: ' + jobId);

    if (jobId == null) {
      throwError('Failed to upload file, no job id.');
    }

    let pollResponse: PollJobResponse = await pollJob();

    while (!pollResponse) {
      await sleep(this.flags.pollinterval);
      pollResponse = await pollJob();
    }

    return {
      ok: 'true',
      warnings: pollResponse.warnings
    };

    async function sleep(ms: number) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }

    async function pollJob() {

      try {
        const input = {
          jobId
        };
        const body: { ok: boolean, errorMessage: string, jobInfo: { Status: string, ExtendedStatus: string} } = await conn.apex.post(ImportConfig.IMPORT_CONFIG_JOB_STAT_PATH, input);
        if (!body.ok) {
          throwError(body.errorMessage);
        }

        switch (body.jobInfo.Status) {
          case 'Completed':
            return body;
          case 'Failed':
            throwError(body.jobInfo.ExtendedStatus);
          case 'Aborted':
            throwError(body.jobInfo.ExtendedStatus);
          default:
            break;
        }

        return null;

      } catch (e) {
        console.log('pollingerror', e);
       // throwError(e);
      }

    }

    async function uploadFile() {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fileAsJson = JSON.parse(fileContent);

      try {
        const response: { jobId } = await conn.apex.post(`${ImportConfig.IMPORT_CONFIG_JOB_SUBMIT}`, fileAsJson, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        return response?.jobId;
      } catch (e) {
        throwError(e);
      }
    }

    function throwError(message: string) {
      ux.stopSpinner('Failed!');
      throw new SfError('Failed to import configuration file. ' + ((message) ? message : ''));
    }
  }

}
