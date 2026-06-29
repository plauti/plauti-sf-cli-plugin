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

    if (!flags['plauti-cloud-api-key']) {
      throw new Error('Parameter plauti-cloud-api-key is required.');
    }

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Linking sandbox');
    }
    
    try {
      // Create service with dependency injection
      const plautiCloudClient = new PlautiCloudClientImpl();
      const orgInfoClient = new OrgInfoClientImpl();
      const sandboxService = new SandboxManagementService(plautiCloudClient, orgInfoClient);

      // Execute sandbox link business logic
      const linkParams: any = {
        org: flags['target-org'],
        sandboxName: flags['sandbox-name'],
        plautiCloudApiKey: flags['plauti-cloud-api-key']
      };

      if (flags['organization-id']) {
        linkParams.organizationId = flags['organization-id'];
      }

      if (flags['sandbox-username']) {
        linkParams.sandboxUsername = flags['sandbox-username'];
      }

      const result = await sandboxService.linkSandbox(linkParams);

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
      throw new Error(formatError('link sandbox', `${error}`));
    }
  }
}