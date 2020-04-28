import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, Org, Connection } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs-extra';

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

    public static args = [{ name: 'file' }];

    //   protected static flagsConfig = {
    //     // flag with a value (-n, --name=VALUE)
    //         name: flags.string({char: 'f', description: messages.getMessage('fileFlagDescription')}),
    //         force: flags.boolean({char: 'd', description: messages.getMessage('directoryFlagDescription')})
    //   };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = true;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = true;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = false;

    protected static defaultExportDirectory = './export/';

    public async run(): Promise<AnyJson> {

        this.ux.startSpinner(`Downloading from export file`);
        // await fs.ensureDir(ExportConfig.exportDir);

        const conn = this.org.getConnection();

        this.ux.log(`${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/search`);

        const searchInput = {
            objectPrefix: "00Q",
            objectData: {
                firstName: 'woj'
            }
        }

        const defaultRequest = {
            json: true,
            headers: {
                Authorization: `Bearer ${conn.accessToken}`
            },
            url: `${conn.instanceUrl}/services/apexrest/dupcheck/dc3Api/search`,
            method: 'post',
            body: JSON.stringify(searchInput)
        };

        const logger = this.ux;
        let filePath = '';

        if (this.args.file) {
            filePath = this.args.file;
        } else {
            filePath = ExportConfig.defaultExportDirectory + (new Date().toISOString() + '.json');
        }

        logger.log(filePath);

        let exportContent = null;
        await conn.requestRaw(defaultRequest)
            .then(function (response) {
                logger.log(JSON.stringify(response.body));
                exportContent = response.body;
            })
            .catch(function (err) {
                logger.errorJson(err);
            });

        await fs.writeFile(`${filePath}`, exportContent);
        this.ux.stopSpinner('Done!');

        return {
            path: filePath
        };
    }
}
