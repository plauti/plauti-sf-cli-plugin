import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class ListSandbox extends SfCommand<{ status: string; sandboxes: unknown }> {
  public static readonly summary = 'List all sandbox orgs';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --plauti-cloud-api-key plauti_123_123456',
    '$ sf plauti:deduplicate:sandbox:list --target-org myOrg@example.com --plauti-cloud-api-key plauti_123_123456'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
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

  public async run(): Promise<{ status: string; sandboxes: unknown }> {
    const { flags } = await this.parse(ListSandbox);
    
    this.logger = createLogger(flags);
    const spinnerLogger = this.logger.createSpinnerLogger();
    
    const org = flags['target-org'];

    if (!flags['plauti-cloud-api-key']) {
      throw new Error('Parameter plauti-cloud-api-key is required.');
    }

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Getting linked sandboxes');
    }
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
      
      if (flags.json) {
        this.logger.json({ status: 'done', sandboxes: content });
      } else {
        this.logger.info(JSON.stringify(content, null, 2));
      }
      
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Done!');
      }
    } catch (error) {
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Failed!');
      }
      throw new Error(formatError('get linked sandboxes', `${error}`));
    }

    return {
      status: 'done',
      sandboxes: content
    };
  }
}