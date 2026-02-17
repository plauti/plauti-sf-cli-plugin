import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class LinkSandbox extends SfCommand<{ status: string }> {
  public static readonly summary = 'Link Sandbox to Production';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --sandbox-name mysandbox --plauti-cloud-api-key plauti_123_123456',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --sandbox-username scratch_org_1 --sandbox-name mysandbox --plauti-cloud-api-key plauti_123_123456',
    '$ sf plauti:deduplicate:sandbox:link --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --sandbox-name mysandbox --plauti-cloud-api-key plauti_123_123456'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    'organization-id': Flags.string({
      description: 'Sandbox Organization Id',
      required: false
    }),
    'sandbox-username': Flags.string({
      description: 'Sandbox User Name',
      required: false
    }),
    'sandbox-name': Flags.string({
      description: 'Sandbox Name',
      required: true
    }),
    'plauti-cloud-api-key': Flags.string({
      description: 'Plauti Cloud Api Key',
      required: true
    }),
    json: Flags.boolean({
      description: 'Format output as json',
      default: false
    }),
    verbose: Flags.boolean({
      description: 'Show verbose output including job IDs and file paths',
      default: false
    })
  };

  public static readonly requiresProject = false;

  private logger!: LoggingUtility;

  public async run(): Promise<{ status: string }> {
    const { flags } = await this.parse(LinkSandbox);
    
    this.logger = createLogger(flags);
    const spinnerLogger = this.logger.createSpinnerLogger();
    
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

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Linking sandbox');
    }
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${sandboxOrgId}/${(org as any).getOrgId()}`, {
        method: 'PUT',
        headers: {
          'Authorization': flags['plauti-cloud-api-key'] as string,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: (org as any).getUsername(),
          sandboxName: flags['sandbox-name']
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Done!');
      }
    } catch (error) {
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Failed!');
      }
      throw new Error(formatError('link sandbox', `${error}`));
    }

    if (flags.json) {
      this.logger.json({ status: 'done' });
    }

    return {
      status: 'done'
    };
  }
}