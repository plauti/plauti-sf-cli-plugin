import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class UnlinkSandbox extends SfCommand<{ status: string }> {
  public static readonly summary = 'Unlink Sandbox';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --plauti-cloud-api-key plauti_123_123456',
    '$ sfdx plauti:duplicatecheck:sandbox:unlink --targetusername myOrg@example.com --organization-id 00DR0000001ossaMAA --plauti-cloud-api-key plauti_123_123456'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    // BC: Support legacy flag name
    'targetusername': Flags.requiredOrg({
      hidden: true,
      deprecated: { message: 'Use --target-org instead' }
    }),
    'organization-id': Flags.string({
      description: 'Sandbox Organization Id',
      required: true
    }),
    'plauti-cloud-api-key': Flags.string({
      description: 'Plauti Cloud Api Key',
      required: true
    })
  };

  public static readonly requiresProject = false;

  public async run(): Promise<{ status: string }> {
    const { flags } = await this.parse(UnlinkSandbox);
    
    // BC: Support legacy targetusername flag
    let org = flags['target-org'];
    if (!org && flags['targetusername']) {
      this.warn('--targetusername is deprecated. Use --target-org instead.');
      org = flags['targetusername'];
    }

    if (!flags['organization-id']) {
      throw new Error('Parameter organization-id is required.');
    }

    if (!flags['plauti-cloud-api-key']) {
      throw new Error('Parameter plauti-cloud-api-key is required.');
    }

    this.spinner.start('Unlinking sandbox');
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${flags['organization-id']}/${(org as any).getOrgId()}`, {
        method: 'DELETE',
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