import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, Org, Connection } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('plauti-sfdx', 'export-config');

export default class RefreshLicense extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx plauti:duplicatecheck:license:refresh --targetusername myOrg@example.com`
    ];

    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;
    protected static defaultExportDirectory = '/export/';

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        const defaultRequest = {
            json: true,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/refresh-license`,
            method: 'post',
        };

        const ux = this.ux;
        this.ux.startSpinner(`Refreshing license`);
        await conn.requestRaw(defaultRequest)
            .then(function (response) {
                if (response.statusCode != 200){
                    ux.stopSpinner('Failed!');
                    throw new SfdxError('Failed to refresh license. ' + response.statusCode);
                } else {
                    ux.stopSpinner('Done!');
                }
            });

        return {
            status: 'done'
        };
    }
}
