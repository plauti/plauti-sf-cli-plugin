import { SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class RefreshLicense extends SfdxCommand {

    public static description = 'Refresh license';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:license:refresh --targetusername myOrg@example.com`
    ];

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

        this.ux.startSpinner(`Refreshing license`);
        const response = await conn.requestRaw(defaultRequest)
        if (response.statusCode != 200){
            this.ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to refresh license. ' + response.statusCode);
        } else {
            this.ux.stopSpinner('Done!');
        }

        return {
            status: 'done'
        };
    }
}
