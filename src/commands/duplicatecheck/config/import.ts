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

        let filePath = this.flags.file;

        let stats = fs.statSync(filePath);

        if (!stats.isFile){
            throw new SfdxError('File not found: ' + filePath);
        } else if (stats.isDirectory()){
            throw new SfdxError('Can not import directory: ' + filePath);
        }

        let fileContent = fs.readFileSync(filePath, 'utf-8');

        const defaultRequest = {
            json: true,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`,
                "Content-Type" : "application/json; charset=utf-8"
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/import-config`,
            method: 'post',
            body: fileContent
        };

        const ux = this.ux;

        this.ux.startSpinner(`Importing configuration file`);
        await conn.requestRaw(defaultRequest)
            .then(function (response) {
                if (response.statusCode != 200){
                    console.log(response.body);
                    ux.stopSpinner('Failed!');
                    throw new SfdxError('Failed to import configuration file. ' + response.statusCode);
                } else {
                    ux.stopSpinner('Done!');
                }
            });

        return {
            ok: 'true'
        };
    }
}
