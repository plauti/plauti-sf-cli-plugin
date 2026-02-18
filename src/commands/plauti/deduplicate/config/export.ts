import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';
import { ConfigExportService } from '../../../../services/ConfigExportService.js';
import { SalesforceJobClientImpl } from '../../../../services/clients/SalesforceJobClient.js';
import { FileSystemClientImpl } from '../../../../services/clients/FileSystemClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class ExportConfig extends SfCommand<{ path: string }> {
  public static readonly summary = 'Export Plauti Deduplicate configuration';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./export/test_config.json --poll-interval 10',
    '$ sf plauti:deduplicate:config:export --target-org myOrg@example.com --file ./export/test_config.json'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    file: Flags.file({
      description: 'Export file path and name',
      required: true
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

  public async run(): Promise<{ path: string }> {
    const { flags } = await this.parse(ExportConfig);
    
    this.logger = createLogger(flags);
    const spinnerLogger = this.logger.createSpinnerLogger();

    const targetOrg = flags['target-org'];
    const connection = (targetOrg as any).getConnection();
    const filePath = flags.file as string;
    const pollInterval = flags['poll-interval'] as number;

    if (spinnerLogger.shouldShowSpinner) {
      this.spinner.start('Downloading export file');
    }

    try {
      // Create service with dependency injection
      const jobClient = new SalesforceJobClientImpl();
      const fileSystem = new FileSystemClientImpl();
      const exportService = new ConfigExportService(jobClient, fileSystem);

      // Execute export business logic
      const result = await exportService.exportConfig({
        connection,
        filePath,
        pollInterval
      });

      this.logger.logJobDetails('jobId', result.jobId!);
      this.logger.logJobDetails('filePath', result.filePath!);

      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Done!');
      }

      if (flags.json) {
        this.logger.json({ path: filePath });
      }

      return { path: filePath };
    } catch (error) {
      if (spinnerLogger.shouldShowSpinner) {
        this.spinner.stop('Failed!');
      }
      throw new Error(formatError('export configuration file', `${error}`));
    }
  }
}