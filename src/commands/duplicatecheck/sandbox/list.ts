import { SfdxCommand} from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class ListSandbox extends SfdxCommand {

    public static description = 'List all sandbox orgs';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:list --targetusername myOrg@example.com`
    ];

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        const defaultRequest = {
            json: true,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/get-linked-sandboxes`,
            method: 'post',
        };

        const ux = this.ux;
        this.ux.startSpinner(`Getting linked sandboxes`);
        await conn.requestRaw(defaultRequest)
            .then(function (response) {
                if (response.statusCode != 200){
                    ux.stopSpinner('Failed!');
                    throw new SfdxError('Failed to get linked sandboxes. ' + response.statusCode);
                } else {
                    ux.stopSpinner('Done!');
                }
            });

        return {
            status: 'done'
        };
    }
}
