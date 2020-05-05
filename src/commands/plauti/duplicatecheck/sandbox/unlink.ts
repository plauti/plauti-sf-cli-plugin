import { SfdxCommand, FlagsConfig, flags} from '@salesforce/command';
import { Messages, SfdxError, Org} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class LinkSandbox extends SfdxCommand {

    public static description = 'Unlink Sandbox from Production';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:unlink --targetusername myOrg@example.com --organizationid 00DR0000001ossaMAA`,
        `$ sfdx plauti:duplicatecheck:sandbox:unlink --targetusername myOrg@example.com --sandboxusername scratch_org_1`
    ];

    protected static flagsConfig: FlagsConfig = {
        organizationid: flags.string({
            description: 'Sandbox Organization Id',
            required: false
        }),
        sandboxusername: flags.string({
            description: 'Sandbox User Name',
            required: false
        }),
    };

    public async run(): Promise<AnyJson> {

        if (!this.flags.organizationid && !this.flags.sandboxusername) {
            throw new SfdxError('Parameter organizationid or sandboxusername is required.');
        }

        const conn = this.org.getConnection();
        var sandboxOrgId = this.flags.organizationid
        if (!sandboxOrgId) {
            const sandboxOrg = await Org.create({aliasOrUsername: this.flags.sandboxusername});
            sandboxOrgId = sandboxOrg.getOrgId();
        } 

        this.ux.startSpinner(`Unlinking sandbox`);
        var response;
        try {
            response = await conn.apex.post('/dupcheck/dc3Api/admin/unlink-sandbox-license',{
                organizationId : sandboxOrgId
            });
        } catch (e) {
            this.ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to unlink sandbox. ' + e);

        }

        this.ux.stopSpinner('Done!');
        return {
            status: 'done'
        };
    }
}
