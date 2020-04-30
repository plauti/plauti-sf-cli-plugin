import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, Org, Connection } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('plauti-sfdx', 'export-config');

export default class ExportConfig extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com`
    ];

    public static args = [{ name: 'file' }];

    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;
    protected static defaultExportDirectory = '/export/';

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();

        const searchInput = {
            objectPrefix: "00Q",
            objectData: {
                firstName: 'woj'
            }
        }

        const defaultRequest = {
            json: true,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/search`,
            method: 'post',
            body: JSON.stringify(searchInput)
        };

        const ux = this.ux;
        let filePath = '';

        if (this.args.file) {
            filePath = this.args.file;
        } else {
            filePath = __dirname + ExportConfig.defaultExportDirectory + (new Date().toISOString() + '.json');
        }

        let exportContent = null;
        this.ux.startSpinner(`Downloading export file`);
        await conn.requestRaw(defaultRequest)
            .then(function (response) {
                // ux.log(JSON.stringify(response.body));
                exportContent = response.body;
                ux.stopSpinner('Done!');
            })
            .catch(function (err) {
                throw new SfdxError(JSON.stringify(err));
            });

        await fs.writeFile(`${filePath}`, exportContent);
        ux.log('File: ' + filePath);

        return {
            path: filePath
        };
    }
}
