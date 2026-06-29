import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ImportCommand from '../../../../../src/commands/plauti/deduplicate/config/import.js';

describe('plauti:deduplicate:config:import', () => {
  it('should use correct command metadata', () => {
    assert.strictEqual(ImportCommand.summary, 'Import Plauti Deduplicate configuration');
    assert.ok(ImportCommand.flags['target-org']);
    assert.ok(ImportCommand.flags['file']);
    assert.ok(ImportCommand.flags['poll-interval']);
    assert.ok(ImportCommand.flags['json']);
    assert.ok(ImportCommand.flags['verbose']);
    assert.strictEqual(ImportCommand.flags['poll-interval'].default, 3);
    assert.strictEqual(ImportCommand.requiresProject, false);
    assert.ok(Array.isArray(ImportCommand.examples));
    assert.ok(ImportCommand.examples.some(example => example.includes('sf plauti:deduplicate:config:import')));
  });

  it('should validate required flags are present', () => {
    assert.strictEqual(ImportCommand.flags['target-org'].required, true);
    assert.strictEqual(ImportCommand.flags['file'].required, true);
  });

  it('should have correct default values for optional flags', () => {
    assert.strictEqual(ImportCommand.flags['poll-interval'].default, 3);
    assert.strictEqual(ImportCommand.flags['json'].default, false);
    assert.strictEqual(ImportCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    assert.ok(ImportCommand.examples.length >= 2);
    assert.ok(ImportCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--file')
    ));
  });

  describe('run() method integration', () => {
    it('should execute run method and return result', async () => {
      const mockOrg = {
        getConnection: () => ({
          sobject: () => ({}),
          version: '54.0'
        })
      };

      const command = new ImportCommand(
        ['--target-org', 'test@example.com', '--file', 'test-config.json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test-config.json',
          'poll-interval': 3,
          'json': false,
          'verbose': false
        }
      });

      const originalConfigImportService = await import('../../../../../src/services/ConfigImportService.js');
      (originalConfigImportService.ConfigImportService.prototype as any).importConfig = async () => ({
        status: 'completed',
        jobId: 'job123',
        recordsImported: 5
      });

      const result = await command.run();

      assert.ok(result);
      assert.strictEqual(result.ok, 'true');
    });

    it('should handle service errors in run method', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ImportCommand(
        ['--target-org', 'test@example.com', '--file', 'test-config.json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test-config.json',
          'poll-interval': 3,
          'json': false,
          'verbose': false
        }
      });

      const originalConfigImportService = await import('../../../../../src/services/ConfigImportService.js');
      (originalConfigImportService.ConfigImportService.prototype as any).importConfig = async () => {
        throw new Error('Service error');
      };

      try {
        await command.run();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok((error as Error).message.includes('Failed to import configuration file'));
      }
    });

    it('should work with JSON flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ImportCommand(
        ['--target-org', 'test@example.com', '--file', 'test.json', '--json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test.json',
          'poll-interval': 3,
          'json': true,
          'verbose': false
        }
      });

      const originalConfigImportService = await import('../../../../../src/services/ConfigImportService.js');
      (originalConfigImportService.ConfigImportService.prototype as any).importConfig = async () => ({
        status: 'completed',
        jobId: 'job123',
        recordsImported: 3
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.ok, 'true');
    });
  });
});