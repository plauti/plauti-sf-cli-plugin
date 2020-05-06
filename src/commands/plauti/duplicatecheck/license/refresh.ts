import { SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);

export default class RefreshLicense extends SfdxCommand {

    public static description = 'Refresh Duplicate Check for Salesforce license';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:license:refresh --targetusername myOrg@example.com`
    ];

    public async run(): Promise<AnyJson> {

        const conn = this.org.getConnection();
        
        this.ux.startSpinner(`Refreshing Duplicate Check for Salesforce license`);
        try {
            await conn.apex.post('/dupcheck/dc3Api/admin/refresh-license',{});
            this.ux.stopSpinner('Done!');
        } catch (e) {
            this.ux.stopSpinner('Failed!');
            throw new SfdxError('Failed to refresh Duplicate Check for Salesforce license. ' + e);
        }
        
        return {
            status: 'done'
        };
    }
}
