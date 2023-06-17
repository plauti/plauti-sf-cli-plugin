import { flags, FlagsConfig, SfdxCommand} from '@salesforce/command';
import { Messages, Org, SfError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class LinkSandbox extends SfdxCommand {

    public static description = 'Link Sandbox to Production';

    public static examples = [
        '$ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --organizationid 00DR0000001ossaMAA --sandboxname mysandbox',
        '$ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --sandboxusername scratch_org_1 --sandboxname mysandbox'
    ];
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    protected static flagsConfig: FlagsConfig = {
        organizationid: flags.string({
            description: 'Sandbox Organization Id',
            required: false
        }),
        sandboxusername: flags.string({
            description: 'Sandbox User Name',
            required: false
        }),
        sandboxname: flags.string({
            description: 'Sandbox Name',
            required: true
        })
    };

    public async run(): Promise<AnyJson> {

        if (!this.flags.organizationid && !this.flags.sandboxusername) {
            throw new SfError('Parameter organizationid or sandboxusername is required.');
        }

        const conn = this.org.getConnection();
        let sandboxOrgId = this.flags.organizationid;
        if (!sandboxOrgId) {
            const sandboxOrg = await Org.create({aliasOrUsername: this.flags.sandboxusername});
            sandboxOrgId = sandboxOrg.getOrgId();
        }

        this.ux.startSpinner('Linking sandbox');
        try {
            await conn.apex.post('/dupcheck/dc3Api/admin/link-sandbox-license', {
                organizationId : sandboxOrgId,
                sandboxName : this.flags.sandboxname
            });
            this.ux.stopSpinner('Done!');
        } catch (e) {
            this.ux.stopSpinner('Failed!');
            throw new SfError('Failed to link sandbox. ' + e);

        }
        return {
            status: 'done'
        };
    }
}
