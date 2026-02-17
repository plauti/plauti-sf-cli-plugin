import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class ListSandbox extends SfCommand<{ status: string; sandboxes: unknown }> {
  public static readonly summary = 'List all sandbox orgs';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --plauti-cloud-api-key plauti_123_123456',
    '$ sfdx plauti:duplicatecheck:sandbox:list --targetusername myOrg@example.com --plauti-cloud-api-key plauti_123_123456'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
    // BC: Support legacy flag name
    'targetusername': Flags.requiredOrg({
      hidden: true,
      deprecated: { message: 'Use --target-org instead' }
    }),
    'plauti-cloud-api-key': Flags.string({
      description: 'Plauti Cloud Api Key',
      required: true
    })
  };

  public static readonly requiresProject = false;

  public async run(): Promise<{ status: string; sandboxes: unknown }> {
    const { flags } = await this.parse(ListSandbox);
    
    // BC: Support legacy targetusername flag
    let org = flags['target-org'];
    if (!org && flags['targetusername']) {
      this.warn('--targetusername is deprecated. Use --target-org instead.');
      org = flags['targetusername'];
    }

    if (!flags['plauti-cloud-api-key']) {
      throw new Error('Parameter plauti-cloud-api-key is required.');
    }

    this.spinner.start('Getting linked sandboxes');
    let content = null;

    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${(org as any).getOrgId()}`, {
        headers: {
          Authorization: flags['plauti-cloud-api-key'] as string
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      content = await response.json();
      this.logJson(content);
      this.spinner.stop('Done!');
    } catch (error) {
      this.spinner.stop('Failed!');
      throw new Error('Failed to get linked sandboxes. ' + error);
    }

    return {
      status: 'done',
      sandboxes: content
    };
  }
}