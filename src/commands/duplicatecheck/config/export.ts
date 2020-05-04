import { SfdxCommand, FlagsConfig, flags } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

Messages.importMessagesDirectory(__dirname);

export default class ExportConfig extends SfdxCommand {

    public static description = 'Export Plauti Duplicate Check configuration';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;
    protected static defaultExportDirectory = '/export/';

    public static examples = [
        `$ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com`
    ];

    protected static flagsConfig: FlagsConfig = {
        file: flags.filepath({
            char: 'f',
            description: 'Export file path',
            required: false
        }),
        pollinterval: flags.integer({
            char: 'p',
            description: 'Poll interval in seconds',
            required: false,
            default: 3
        })
    };

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
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
            sleep(this.flags.pollinterval);
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

        function sleep(ms: number) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }

        async function submitJob() {
            const request = {
                json: true,
                headers: {
                    Authorization: `Bearer ${conn.accessToken}`
                },
                url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/export-config`,
                method: 'post'
            };

            const response = await conn.requestRaw(request);
            if (response.statusCode != 200) {
                throwError(response.statusCode +'');
                
            }
            else {
                let body = JSON.parse(response.body.toString());

                if (!body.ok){
                    throwError(body.errorMessage);
                }

                return body.jobId;
            }
        }

        async function pollJob() {
            const request = {
                json: true,
                headers: {
                    Authorization: `Bearer ${conn.accessToken}`,
                    "Content-Type": "application/json; charset=utf-8",
                    'Cache-Control': 'no-cache'
                },
                url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/export-config-job-stat`,
                method: 'post',
                body: jobId
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
            }
        }

        async function downloadFile() {
            const downloadRequest = {
                json: true,
                headers: {
                    Authorization: `Bearer ${conn.accessToken}`
                },
                url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/export-config-download`,
                method: 'post',
                body: jobId
            };

            const response = await conn.requestRaw(downloadRequest)
            if (response.statusCode != 200) {
                throwError(response.statusCode +'');
            } else {
                return response.body.toString();
            }

        }

        function throwError(message : string){
            this.ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to export configuration file. ' + ((message) ? message : ''));
        }
    }

}
