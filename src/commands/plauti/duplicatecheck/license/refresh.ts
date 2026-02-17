import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

export default class Refresh extends SfCommand<{ status: string }> {
  public static readonly summary = 'Refresh Duplicate Check for Salesforce license';
  
  public static readonly examples = [
    '<%= config.bin %> <%= command.id %> --target-org myOrg@example.com'
  ];

  public static readonly flags = {
    'target-org': Flags.requiredOrg()
  };

  public static readonly requiresProject = false;

  public async run(): Promise<{ status: string }> {
    const { flags } = await this.parse(Refresh);
    const conn = (flags['target-org'] as any).getConnection();

    this.spinner.start('Refreshing Duplicate Check for Salesforce license');
    
    try {
      await conn.apex.post('/dupcheck/dc3Api/admin/refresh-license', {});
      this.spinner.stop('Done!');
    } catch (error) {
      this.spinner.stop('Failed!');
      throw new Error(`Failed to refresh Duplicate Check for Salesforce license. ${error}`);
    }

    return {
      status: 'done'
    };
  }
}