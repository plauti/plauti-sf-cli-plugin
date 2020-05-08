import { SfdxCommand, FlagsConfig, flags } from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

Messages.importMessagesDirectory(__dirname);

export interface SubmitJobResponse {
    ok?: boolean;
    jobId?: object;
    errorMessage : string
}

export interface PollJobResponse {
    ok?: boolean;
    errorMessage : string
    jobInfo?: JobInfo;
}

export interface JobInfo {
    Status?: string;
    ExtendedStatus : string
    jobInfo?: AnyJson;
}

export default class ExportConfig extends SfdxCommand {

    public static description = 'Export Plauti Duplicate Check configuration';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;
    protected static defaultExportDirectory = '/export/';

    private static EXPORT_CONFIG_JOB_SUBMIT = '/dupcheck/dc3Api/admin/export-config';
    private static EXPORT_CONFIG_JOB_STAT_PATH = '/dupcheck/dc3Api/admin/export-config-job-stat';
    private static EXPORT_CONFIG_DOWNLOAD = '/dupcheck/dc3Api/admin/export-config-download';

    public static examples = [
        `$ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com --file ./export/test_config.json`,
        `$ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com --file ./export/test_config.json --pollinterval 10`
    ];

    protected static flagsConfig: FlagsConfig = {
        file: flags.filepath({
            description: 'Export file path and name',
            required: true
        }),
        pollinterval: flags.integer({
            description: 'Poll interval in seconds',
            required: false,
            default: 3
        })
    };

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        const ux = this.ux;
        this.ux.startSpinner(`Downloading export file`);

        let filePath = '';

        if (this.flags.file) {
            filePath = this.flags.file;
        } else {
            filePath = __dirname + ExportConfig.defaultExportDirectory + (new Date().toISOString() + '.json');
        }

        let jobId = await submitJob();
        this.ux.log('Job id: ' + jobId);

        if (jobId == null) {
            throwError('Failed to upload file, not job id.');
        }

        let pollDone = await pollJob();

        while (!pollDone) {
            await sleep(this.flags.pollinterval);
            pollDone = await pollJob();
        }

        let fileContent = await downloadFile();
        this.ux.stopSpinner('Done!');

        await fs.writeFile(`${filePath}`, fileContent, {
            encoding: "utf-8",
            flag: "w"
        });
        this.ux.log('File: ' + filePath);

        return {
            path: filePath
        };

        async function sleep(ms: number) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }

        async function submitJob() {
            try {
                const body : SubmitJobResponse = await conn.apex.post(ExportConfig.EXPORT_CONFIG_JOB_SUBMIT,{});
                
                if (!body.ok){
                    throwError(body.errorMessage);
                }
                return body.jobId;
            } catch (e) {
                throwError(e);
            }
        }

        async function pollJob() {

            try {
                const input = {
                    jobId : jobId
                }
                const body : PollJobResponse = await conn.apex.post(ExportConfig.EXPORT_CONFIG_JOB_STAT_PATH,input);
                
                if (!body.ok){
                    throwError(body.errorMessage);
                }
                
                switch (body.jobInfo.Status) {
                    case 'Completed':
                        return true;
                    case 'Failed':
                        throwError(body.jobInfo.ExtendedStatus);
                    case 'Aborted':
                        throwError(body.jobInfo.ExtendedStatus);
                    default:
                        break;
                }

            } catch (e) {
                throwError(e);
            }

        }

        async function downloadFile() {
            const input = {
                jobId : jobId
            }
            const body = await conn.apex.post(ExportConfig.EXPORT_CONFIG_DOWNLOAD,input);
            return body;
        }

        function throwError(message : string){
            ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to export configuration file. ' + ((message) ? message : ''));
        }
    }

}
