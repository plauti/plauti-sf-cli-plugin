import { SfdxCommand, FlagsConfig, flags } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

Messages.importMessagesDirectory(__dirname);

export default class ImportConfig extends SfdxCommand {

    public static description = 'Import Plauti Duplicate Check configuration';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;

    private static IMPORT_CONFIG_JOB_SUBMIT = 'services/apexrest/dupcheck/dc3Api/admin/import-config';
    private static IMPORT_CONFIG_JOB_STAT_PATH = 'services/apexrest/dupcheck/dc3Api/admin/import-config-job-stat';

    public static examples = [
        `$ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com`
    ];

    protected static flagsConfig: FlagsConfig = {
        file: flags.filepath({
            char: 'f',
            description: 'File path',
            required: true
        }),
        pollinterval: flags.integer({
            char: 'p',
            description: 'Poll interval in seconds',
            required: false,
            default: 3
        })
    };

    public async run(): Promise<AnyJson> {

        this.ux.startSpinner(`Importing configuration file`);
        const conn = this.org.getConnection();
        const ux = this.ux;

        let filePath = this.flags.file;
        let stats = fs.statSync(filePath);

        if (!stats.isFile) {
            throwError('File not found: ' + filePath);
        } else if (stats.isDirectory()) {
            throwError('Can not import directory: ' + filePath);
        }

        let jobId = await uploadFile();
        this.ux.log('Job Id: ' + jobId);

        if (jobId == null) {
            throwError('Failed to upload file, not job id.');
        }

        let pollDone = await pollJob();

        while (!pollDone) {
            sleep(this.flags.pollinterval);
            pollDone = await pollJob();
        }

        return {
            ok: 'true',
            warnings: null
        };

        function sleep(ms: number) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }

        async function pollJob() {
            const request = {
                json: true,
                headers: {
                    Authorization: `Bearer ${conn.accessToken}`,
                    "Content-Type": "application/json; charset=utf-8",
                    'Cache-Control': 'no-cache'
                },
                url: `${conn.instanceUrl}/${ImportConfig.IMPORT_CONFIG_JOB_STAT_PATH}`,
                method: 'post',
                body: jobId
            };

            const response = await conn.requestRaw(request);
            if (response.statusCode != 200) {
                throwError(response.statusCode + '');
            } else {
                let body = JSON.parse(response.body.toString());

                if (!body.ok){
                    throwError(body.errorMessage);
                }

                switch (body.jobInfo.Status) {
                    case 'Completed':
                        ux.stopSpinner('Done!');
                        return true;
                    case 'Failed':
                        throwError(body.jobInfo.ExtendedStatus);
                    case 'Aborted':
                        throwError(body.jobInfo.ExtendedStatus);
                    default:
                        break;
                }
            }
        }

        async function uploadFile() {
            let fileContent = fs.readFileSync(filePath, 'utf-8');
            const request = {
                json: false,
                headers: {
                    Authorization: `Bearer ${conn.accessToken}`,
                    "Content-Type": "application/json; charset=utf-8",
                    'Cache-Control': 'no-cache'
                },
                url: `${conn.instanceUrl}/${ImportConfig.IMPORT_CONFIG_JOB_SUBMIT}`,
                method: 'post',
                body: fileContent
            };

            const response = await conn.requestRaw(request);
            if (response.statusCode != 200) {
                console.log(response.body);
                throwError(response.statusCode +'');
            } else {
                let body = JSON.parse(response.body.toString());
                if (!body.ok){
                    throwError(body.errorMessage);
                }
                return body.jobId;
            }
        }

        function throwError(message : string){
            ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to import configuration file. ' + ((message) ? message : ''));
        }
    }

}
