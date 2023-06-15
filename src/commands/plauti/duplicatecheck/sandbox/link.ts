import { SfdxCommand, FlagsConfig, flags} from '@salesforce/command';
import { Messages, SfdxError, Org} from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import axios from 'axios';

Messages.importMessagesDirectory(__dirname);

export default class LinkSandbox extends SfdxCommand {

  public static description = 'Link Sandbox to Production';
  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public static examples = [
    `$ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --organizationid 00DR0000001ossaMAA --sandboxname mysandbox --plauticloudapikey plauti_123_123456`,
    `$ sfdx plauti:duplicatecheck:sandbox:link --targetusername myOrg@example.com --sandboxusername scratch_org_1 --sandboxname mysandbox --plauticloudapikey plauti_123_123456`
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
    }),
    plauticloudapikey: flags.string({
      description: 'Plauti Cloud Api Key',
      required: true
    })
  };

  public async run(): Promise<AnyJson> {

    if (!this.flags.organizationid && !this.flags.sandboxusername) {
      throw new SfdxError('Parameter organizationid or sandboxusername is required.');
    }

    if (!this.flags.plauticloudapikey) {
      throw new SfdxError('Parameter plauticloudapikey is required.');
    }

    let sandboxOrgId = this.flags.organizationid;
    if (!sandboxOrgId) {
      const sandboxOrg = await Org.create({aliasOrUsername: this.flags.sandboxusername});
      sandboxOrgId = sandboxOrg.getOrgId();
    }

    this.ux.startSpinner('Linking sandbox');
    try {
      await axios.put(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${sandboxOrgId}/${this.org.getOrgId()}`, {
        username: this.org.getUsername(),
        sandboxName: this.flags.sandboxname
      }, {
        headers: {
          Authorization: this.flags.plauticloudapikey
        }
      });

      this.ux.stopSpinner('Done!');
    } catch (e) {
      this.ux.stopSpinner('Failed!');
      throw new SfdxError('Failed to link sandbox. ' + e);
    }

    return {
      status: 'done'
    };
  }
}
