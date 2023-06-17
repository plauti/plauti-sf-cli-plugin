import { SfdxCommand} from '@salesforce/command';
import { Messages, SfError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class ListSandbox extends SfdxCommand {

    public static description = 'List all sandbox orgs';

    public static examples = [
        '$ sfdx plauti:duplicatecheck:sandbox:list --targetusername myOrg@example.com'
    ];
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        this.ux.startSpinner('Getting linked sandboxes');
        let content = null;

        try {
            content = await conn.apex.post('/dupcheck/dc3Api/admin/get-linked-sandboxes', {});
            this.ux.logJson(content);
            this.ux.stopSpinner('Done!');
        } catch (e) {
            this.ux.stopSpinner('Failed!');
            throw new SfError('Failed to get linked sandboxes. ' + e);
        }

        return {
            status: 'done',
            sandboxes : content
        };
    }
}
