import { SfdxCommand, FlagsConfig, flags} from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('plauti-sfdx', 'export-config');

export default class LinkSandbox extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:unlink --targetusername myOrg@example.com`
    ];

    protected static requiresUsername = true;
    protected static supportsDevhubUsername = true;
    protected static requiresProject = false;

    protected static flagsConfig: FlagsConfig = {
        organizationId: flags.string({
            char: 'p',
            description: 'Production alias',
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
                    organizationId : this.flags.organizationId
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
