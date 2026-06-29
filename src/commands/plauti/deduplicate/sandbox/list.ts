import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';
import { SandboxManagementService } from '../../../../services/SandboxManagementService.js';
import { PlautiCloudClientImpl } from '../../../../services/clients/PlautiCloudClient.js';
import { OrgInfoClientImpl } from '../../../../services/clients/OrgInfoClient.js';

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

    if (!flags['plauti-cloud-api-key']) {
      throw new Error('Parameter plauti-cloud-api-key is required.');
    }

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Getting linked sandboxes');
    }

    try {
      // Create service with dependency injection
      const plautiCloudClient = new PlautiCloudClientImpl();
      const orgInfoClient = new OrgInfoClientImpl();
      const sandboxService = new SandboxManagementService(plautiCloudClient, orgInfoClient);

      // Execute sandbox list business logic
      const result = await sandboxService.listSandboxes({
        org: flags['target-org'] as any,
        plautiCloudApiKey: flags['plauti-cloud-api-key'] as string
      });
      
      if (flags.json) {
        this.logger.json({ status: result.status, sandboxes: result.sandboxes });
      } else {
        this.logger.info(JSON.stringify(result.sandboxes, null, 2));
      }
      
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Done!');
      }

      return {
        status: result.status,
        sandboxes: result.sandboxes
      };
    } catch (error) {
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Failed!');
      }
      throw new Error(formatError('get linked sandboxes', `${error}`));
    }
  }
}