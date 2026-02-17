import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';

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
    const conn = (targetOrg as any).getConnection();

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Refreshing Plauti Deduplicate for Salesforce license');
    }
    
    try {
      await conn.apex.post('/dupcheck/dc3Api/admin/refresh-license', {});
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Done!');
      }
    } catch (error) {
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Failed!');
      }
      throw new Error(formatError('refresh Plauti Deduplicate for Salesforce license', `${error}`));
    }

    if (flags.json) {
      this.logger.json({ status: 'done' });
    }

    return {
      status: 'done'
    };
  }
}