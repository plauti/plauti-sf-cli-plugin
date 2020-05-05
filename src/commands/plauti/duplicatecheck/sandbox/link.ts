import { SfdxCommand, FlagsConfig, flags} from '@salesforce/command';
import { Messages, SfdxError, Org} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class LinkSandbox extends SfdxCommand {

    public static description = 'Link Sandbox to Production';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --organizationid 00DR0000001ossaMAA --sandboxname mysandbox`,
        `$ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --sandboxusername scratch_org_1 --sandboxname mysandbox`
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
        sandboxname: flags.string({
            description: 'Sandbox Name',
            required: true
        })
    };

    public async run(): Promise<AnyJson> {

        const ux = this.ux;

        if (!this.flags.organizationid && !this.flags.sandboxusername) {
            throw new SfdxError('Parameter organizationid or sandboxusername is required.');
        }

        const conn = this.org.getConnection();
        var sandboxOrgId = this.flags.organizationid
        if (!sandboxOrgId) {
            const sandboxOrg = await Org.create({aliasOrUsername: this.flags.sandboxusername});
            sandboxOrgId = sandboxOrg.getOrgId();
        } 

        this.ux.startSpinner('Linking sandbox');
        var response;
        try {
            response = await conn.apex.post('/dupcheck/dc3Api/admin/link-sandbox-license',{
                organizationId : sandboxOrgId,
                sandboxName : this.flags.sandboxname
            });
        } catch (e) {
            this.ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to link sandbox. ' + e);

        }
        ux.stopSpinner('Done!');
        return {
            status: 'done',
        };
    }
}
