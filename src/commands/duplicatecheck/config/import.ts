import { SfdxCommand, FlagsConfig, flags } from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

Messages.importMessagesDirectory(__dirname);

export default class ImportConfig extends SfdxCommand {

    public static description = 'Import Plauti Duplicate Check configuration'

    public static examples = [
        `$ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com`
    ];

    protected static flagsConfig: FlagsConfig = {
        file: flags.filepath({
            char: 'f',
            description: 'File path',
            required: true
        })
    };

    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        conn.cache.clear();

        let filePath = this.flags.file;
        let stats = fs.statSync(filePath);

        if (!stats.isFile){
            throw new SfdxError('File not found: ' + filePath);
        } else if (stats.isDirectory()){
            throw new SfdxError('Can not import directory: ' + filePath);
        }

        let fileContent = fs.readFileSync(filePath, 'utf-8');

        const submitRequest = {
            json: false,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`,
                "Content-Type" : "application/json; charset=utf-8",
                'Cache-Control': 'no-cache'
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/import-config`,
            method: 'post',
            body: fileContent
        };

        const ux = this.ux;
        this.ux.startSpinner(`Importing configuration file`);
        let jobId = null;
        await conn.requestRaw(submitRequest)
            .then(function (response) {
                // console.log(response.body);
                if (response.statusCode != 200){
                    ux.stopSpinner('Failed!');
                    throw new SfdxError('Failed to import configuration file. ' + response.statusCode);
                } else {
                    let body = JSON.parse(response.body.toString());
                    jobId = body.jobId;
                }
            });

        if (jobId == null){
            throw new SfdxError('Failed to upload file, not job id.');
        }
    
        const pollRequest = {
            json: true,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`,
                "Content-Type" : "application/json; charset=utf-8",
                'Cache-Control': 'no-cache'
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/import-config-job-stats`,
            method: 'post',
            body: jobId
        };

        let jobDone = false;

        while (!jobDone) {
            await sleep(3000);
            console.log('Sleep');
            await conn.requestRaw(pollRequest)
                .then(function (response) {
                    // console.log(response.body);
                    if (response.statusCode != 200){
                        ux.stopSpinner('Failed!');
                        throw new SfdxError('Failed to import configuration file. ' + response.statusCode);
                    } else {
                        let body = JSON.parse(response.body.toString());

                        switch (body.Status) {
                            case 'Completed':
                                ux.stopSpinner('Done!');
                                jobDone = true;
                                break;
                            case 'Failed':
                                ux.stopSpinner('Failed!');
                                jobDone = true;
                                throw new SfdxError('Failed to import configuration file: ' + body.ExtendedStatus);
                            case 'Aborted':
                                ux.stopSpinner('Failed!');
                                jobDone = true;
                                throw new SfdxError('Failed to import configuration file: ' + body.ExtendedStatus);
                            default:
                                break;
                        }
                    }
                });
        }

        return {
            ok: 'true'
        };

        function sleep(ms: number) {
            return new Promise((resolve) => {
              setTimeout(resolve, ms);
            });
          }   
    }
    
}
