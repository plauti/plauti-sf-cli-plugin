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

export default class UnlinkSandbox extends SfCommand<{ status: string }> {
  public static readonly summary = 'Unlink Sandbox';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --plauti-cloud-api-key plauti_123_123456',
    '$ sf plauti:deduplicate:sandbox:unlink --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --plauti-cloud-api-key plauti_123_123456',
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    'organization-id': Flags.string({
      description: 'Sandbox Organization Id',
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
    const { flags } = await this.parse(UnlinkSandbox);
    
    this.logger = createLogger(flags);
    const spinnerLogger = this.logger.createSpinnerLogger();

    if (!flags['organization-id']) {
      throw new Error('Parameter organization-id is required.');
    }

    if (!flags['plauti-cloud-api-key']) {
      throw new Error('Parameter plauti-cloud-api-key is required.');
    }

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Unlinking sandbox');
    }
    
    try {
      // Create service with dependency injection
      const plautiCloudClient = new PlautiCloudClientImpl();
      const orgInfoClient = new OrgInfoClientImpl();
      const sandboxService = new SandboxManagementService(plautiCloudClient, orgInfoClient);

      // Execute sandbox unlink business logic
      const result = await sandboxService.unlinkSandbox({
        org: flags['target-org'] as any,
        organizationId: flags['organization-id'] as string,
        plautiCloudApiKey: flags['plauti-cloud-api-key'] as string
      });

      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Done!');
      }

      if (flags.json) {
        this.logger.json({ status: result.status });
      }

      return {
        status: result.status
      };
    } catch (error) {
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Failed!');
      }
      throw new Error(formatError('unlink sandbox', `${error}`));
    }
  }
}