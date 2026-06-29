import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';
import { ConfigImportService } from '../../../../services/ConfigImportService.js';
import { SalesforceJobClientImpl } from '../../../../services/clients/SalesforceJobClient.js';
import { FileSystemClientImpl } from '../../../../services/clients/FileSystemClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class ImportConfig extends SfCommand<{ ok: string; warnings?: unknown }> {
  public static readonly summary = 'Import Plauti Deduplicate configuration';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json --poll-interval 10',
    '$ sf plauti:deduplicate:config:import --target-org myOrg@example.com --file ./export/test_config.json'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    file: Flags.file({
      description: 'File path',
      required: true,
      exists: true
    }),
    'poll-interval': Flags.integer({
      description: 'Poll interval in seconds',
      required: false,
      default: 3
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

  public async run(): Promise<{ ok: string; warnings?: unknown }> {
    const { flags } = await this.parse(ImportConfig);
    
    this.logger = createLogger(flags);
    const spinnerLogger = this.logger.createSpinnerLogger();

    const targetOrg = flags['target-org'];
    const connection = (targetOrg as any).getConnection();
    const filePath = flags.file as string;
    const pollInterval = flags['poll-interval'] as number;

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Importing configuration file');
    }

    try {
      // Create service with dependency injection
      const jobClient = new SalesforceJobClientImpl();
      const fileSystem = new FileSystemClientImpl();
      const importService = new ConfigImportService(jobClient, fileSystem);

      // Execute import business logic
      const result = await importService.importConfig({
        connection,
        filePath,
        pollInterval
      });

      this.logger.logJobDetails('jobId', result.jobId!);

      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Done!');
      }

      if (flags.json) {
        this.logger.json({ ok: 'true' });
      }

      return { ok: 'true' };
    } catch (error) {
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Failed!');
      }
      throw new Error(formatError('import configuration file', `${error}`));
    }
  }
}