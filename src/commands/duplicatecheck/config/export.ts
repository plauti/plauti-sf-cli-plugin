import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, Org, Connection } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('plauti-sfdx', 'export-config');

export default class ExportConfig extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx plauti:duplicatecheck:config:export --targetusername myOrg@example.com
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    // name: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription')}),
    // force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    this.ux.log(`${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/search`);
    this.ux.log(`Bearer ${conn.accessToken}`);
    
    const searchInput = {
        objectPrefix : "00Q",
        objectData : {
            firstName : 'woj'
        }
    }

    const defaultRequest = {
        json: true,
        headers: {
            Authorization: `Bearer ${conn.accessToken}`
        },
        url : `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/search`,
        method : 'post',
        body : JSON.stringify(searchInput)
    };

    const logger = this.ux;
    let exportContent = null;
    await conn.requestRaw(defaultRequest)
        .then(function (response) {
            logger.log('OK');
            logger.log(JSON.stringify(response.body));
            exportContent = response.body;
        })
        .catch(function (err) {
            logger.errorJson(err);
        });

        return { orgId: this.org.getOrgId(), exportContent};
  }
}
