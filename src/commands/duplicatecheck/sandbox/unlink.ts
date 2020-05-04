import { SfdxCommand, FlagsConfig, flags} from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class LinkSandbox extends SfdxCommand {

    public static description = 'Unlink Sandbox from Production';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:unlink --targetusername myOrg@example.com --orgid 00DR0000001ossaMAA`
    ];

    protected static flagsConfig: FlagsConfig = {
        organizationid: flags.string({
            char: 'o',
            description: 'Production org id',
            required: true
        })
    };

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        const defaultRequest = {
            json: true,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/admin/link-sandbox-license`,
            method: 'post',
            body : JSON.stringify({
                    organizationId : this.flags.organizationid
                }
            )
        };

        this.ux.startSpinner(`Unlinking sandbox`);
        const response = await conn.requestRaw(defaultRequest)
        if (response.statusCode != 200){
            this.ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to unlink sanbox. ' + response.statusCode);
        } else {
            this.ux.stopSpinner('Done!');
        }

        return {
            status: 'done'
        };
    }
}
