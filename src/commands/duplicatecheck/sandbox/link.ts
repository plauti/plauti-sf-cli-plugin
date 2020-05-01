import { SfdxCommand, FlagsConfig, flags} from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class LinkSandbox extends SfdxCommand {

    public static description = 'Link Sandbox to Production';

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --organizationid 00DR0000001ossaMAA --sandboxname mysandbox`
    ];

    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;

    protected static flagsConfig: FlagsConfig = {
        organizationid: flags.string({
            char: 'o',
            description: 'Production organization id',
            required: true
        }),
        sandboxname: flags.string({
            char: 's',
            description: 'Sandbox name',
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
            body : JSON.stringify(
                {
                    organizationId : this.flags.organizationid,
                    sandboxName : this.flags.sandboxname
                }
            )
        };

        const ux = this.ux;
        this.ux.startSpinner(`Linking sandbox`);
        await conn.requestRaw(defaultRequest)
            .then(function (response) {
                if (response.statusCode != 200){
                    ux.stopSpinner('Failed!');
                    throw new SfdxError('Failed to link sanbox. ' + response.statusCode);
                } else {
                    ux.stopSpinner('Done!');
                }
            });

        return {
            status: 'done'
        };
    }
}
