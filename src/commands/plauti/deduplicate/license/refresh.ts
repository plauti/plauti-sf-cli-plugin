import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';
import { LicenseService } from '../../../../services/LicenseService.js';
import { LicenseClientImpl } from '../../../../services/clients/LicenseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class Refresh extends SfCommand<{ status: string }> {
  public static readonly summary = 'Refresh Plauti Deduplicate for Salesforce license';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com',
    '$ sf plauti:deduplicate:license:refresh --target-org myOrg@example.com'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
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
    const { flags } = await this.parse(Refresh);
    
    this.logger = createLogger(flags);
    const spinnerLogger = this.logger.createSpinnerLogger();

    const targetOrg = flags['target-org'];
    const connection = (targetOrg as any).getConnection();

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Refreshing Plauti Deduplicate for Salesforce license');
    }
    
    try {
      // Create service with dependency injection
      const licenseClient = new LicenseClientImpl();
      const licenseService = new LicenseService(licenseClient);

      // Execute license refresh business logic
      const result = await licenseService.refreshLicense({
        connection
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
      throw new Error(formatError('refresh Plauti Deduplicate for Salesforce license', `${error}`));
    }
  }
}