import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class UnlinkSandbox extends SfCommand<{ status: string }> {
  public static readonly summary = 'Unlink Sandbox from Production';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --plauti-cloud-api-key plauti_123_123456',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --sandbox-username scratch_org_1 --plauti-cloud-api-key plauti_123_123456'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    'organization-id': Flags.string({
      description: 'Sandbox Organization Id',
      required: false
    }),
    'sandbox-username': Flags.string({
      description: 'Sandbox User Name',
      required: false
    }),
    'plauti-cloud-api-key': Flags.string({
      description: 'Plauti Cloud Api Key',
      required: true
    })
  };

  public static readonly requiresProject = false;

  public async run(): Promise<{ status: string }> {
    const { flags } = await this.parse(UnlinkSandbox);
    const org = flags['target-org'];

    if (!flags['organization-id'] && !flags['sandbox-username']) {
      throw new Error('Parameter organization-id or sandbox-username is required.');
    }

    if (!flags['plauti-cloud-api-key']) {
      throw new Error('Parameter plauti-cloud-api-key is required.');
    }

    let sandboxOrgId = flags['organization-id'];
    if (!sandboxOrgId) {
      const sandboxOrg = await Org.create({ aliasOrUsername: flags['sandbox-username'] as string });
      sandboxOrgId = sandboxOrg.getOrgId();
    }

    this.spinner.start('Unlinking sandbox');
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${sandboxOrgId}/${(org as any).getOrgId()}`, {
        method: 'POST',
        headers: {
          'Authorization': flags['plauti-cloud-api-key'] as string
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.spinner.stop('Done!');
    } catch (error) {
      this.spinner.stop('Failed!');
      throw new Error('Failed to unlink sandbox. ' + error);
    }

    return {
      status: 'done'
    };
  }
}