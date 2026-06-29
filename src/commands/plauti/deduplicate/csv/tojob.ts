import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createLogger, formatError, LoggingUtility } from '../../../../utils/logging';
import { DuplicateJobService } from '../../../../services/DuplicateJobService.js';
import { CsvReaderImpl } from '../../../../services/clients/CsvReader.js';
import { SalesforceRecordClientImpl } from '../../../../services/clients/SalesforceRecordClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class CsvTojob extends SfCommand<string> {
  public static readonly summary = 'Create A Plauti Deduplicate Job based on a CSV File';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001',
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001 --set-master-for-merge',
    '$ sf plauti:deduplicate:csv:tojob --target-org myOrg@example.com --file ./myFirstJob.csv --source-object 001 --match-object 001'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o'
    }),
    file: Flags.file({ 
      description: 'Csv file path', 
      required: true,
      exists: true 
    }),
    'source-object': Flags.string({ 
      description: 'Source Object Prefix', 
      required: true 
    }),
    'match-object': Flags.string({ 
      description: 'Match Object Prefix', 
      required: true 
    }),
    'set-master-for-merge': Flags.boolean({ 
      description: 'Set Master record for Merge', 
      default: false 
    }),
    delimiter: Flags.string({ 
      description: 'Csv Delimiter', 
      default: ',' 
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

  public async run(): Promise<string> {
    const { flags } = await this.parse(CsvTojob);
    
    this.logger = createLogger(flags);
    
    const targetOrg = flags['target-org'];
    const connection = (targetOrg as any).getConnection();

    try {
      // Create service with dependency injection
      const csvReader = new CsvReaderImpl();
      const recordClient = new SalesforceRecordClientImpl();
      const jobService = new DuplicateJobService(csvReader, recordClient);

      // Execute job creation business logic
      const result = await jobService.createJobFromCsv({
        connection,
        filePath: flags.file as string,
        sourceObject: flags['source-object'] as string,
        matchObject: flags['match-object'] as string,
        setMasterForMerge: flags['set-master-for-merge'] as boolean,
        delimiter: flags.delimiter as string,
        progressCallback: (message: string) => this.logger.logProgress(message)
      });

      if (result.jobId) {
        this.logger.logJobDetails('dcJobId', result.jobId);
      }

      if (result.successCount !== undefined && result.errorCount !== undefined) {
        this.logger.logProgress(`Inserted ${result.successCount} pairs, encountered ${result.errorCount} errors.`);
      }

      if (flags.json) {
        this.logger.json({});
      }

      return '{}';
    } catch (error) {
      throw new Error(formatError('create job from CSV', `${error}`));
    }
  }
}