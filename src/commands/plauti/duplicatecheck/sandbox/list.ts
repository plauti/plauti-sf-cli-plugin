import {flags, FlagsConfig, SfdxCommand} from '@salesforce/command';
import { Messages, SfdxError} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import axios from 'axios';

Messages.importMessagesDirectory(__dirname);

export default class ListSandbox extends SfdxCommand {

    public static description = 'List all sandbox orgs';
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    public static examples = [
        `$ sfdx plauti:duplicatecheck:sandbox:list --targetusername myOrg@example.com --plauticloudapikey plauti_123_123456`
    ];

    protected static flagsConfig: FlagsConfig = {
        plauticloudapikey: flags.string({
            description: 'Plauti Cloud Api Key',
            required: true
        })
    };

    public async run(): Promise<AnyJson> {
        if (!this.flags.plauticloudapikey) {
            throw new SfdxError('Parameter plauticloudapikey is required.');
        }

        this.ux.startSpinner(`Getting linked sandboxes`);
        let content = null;

        try {
            content = (await axios.get(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${this.org.getOrgId()}`, {
                headers: {
                    Authorization: this.flags.plauticloudapikey
                }
            })).data;

            this.ux.logJson(content);
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
