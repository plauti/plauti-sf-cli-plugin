import { SfdxCommand} from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class ListSandbox extends SfdxCommand {

    public static description = 'List all sandbox orgs';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:list --targetusername myOrg@example.com`
    ];

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        this.ux.startSpinner(`Getting linked sandboxes`);
        let content = null;

        try {
            content = await conn.apex.post('/dupcheck/dc3Api/admin/get-linked-sandboxes',{});
            this.ux.log(content);
            this.ux.stopSpinner('Done!');
        } catch (e) {
            this.ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to get linked sandboxes. ' + e);
        }

        return {
            status: 'done',
            sandboxes : content
        };
    }
}
