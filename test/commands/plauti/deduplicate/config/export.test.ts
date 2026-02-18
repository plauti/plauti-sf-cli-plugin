import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ExportCommand from '../../../../../src/commands/plauti/deduplicate/config/export.js';

describe('plauti:deduplicate:config:export', () => {
  it('should use correct command metadata', () => {
    assert.strictEqual(ExportCommand.summary, 'Export Plauti Deduplicate configuration');
    assert.ok(ExportCommand.flags['target-org']);
    assert.ok(ExportCommand.flags['file']);
    assert.ok(ExportCommand.flags['poll-interval']);
    assert.ok(ExportCommand.flags['json']);
    assert.ok(ExportCommand.flags['verbose']);
    assert.strictEqual(ExportCommand.flags['poll-interval'].default, 3);
    assert.strictEqual(ExportCommand.requiresProject, false);
    assert.ok(Array.isArray(ExportCommand.examples));
    assert.ok(ExportCommand.examples.some(example => example.includes('sf plauti:deduplicate:config:export')));
  });

  it('should validate required flags are present', () => {
    assert.strictEqual(ExportCommand.flags['target-org'].required, true);
    assert.strictEqual(ExportCommand.flags['file'].required, true);
  });

  it('should have correct default values for optional flags', () => {
    assert.strictEqual(ExportCommand.flags['poll-interval'].default, 3);
    assert.strictEqual(ExportCommand.flags['json'].default, false);
    assert.strictEqual(ExportCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    assert.ok(ExportCommand.examples.length >= 2);
    assert.ok(ExportCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--file')
    ));
  });

  describe('run() method integration', () => {
    it('should execute run method and return file path', async () => {
      const mockOrg = {
        getConnection: () => ({
          sobject: () => ({}),
          version: '54.0'
        })
      };

      const command = new ExportCommand(
        ['--target-org', 'test@example.com', '--file', 'test-config.json'],
        {} as any
      );

      // Mock the flags to avoid parsing issues
      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test-config.json',
          'poll-interval': 3,
          'json': false,
          'verbose': false
        }
      });

      // Mock ConfigExportService
      const originalConfigExportService = await import('../../../../../src/services/ConfigExportService.js');
      const mockExportConfig = async () => ({
        status: 'completed',
        jobId: 'job123',
        filePath: 'test-config.json'
      });

      // Patch the service
      (originalConfigExportService.ConfigExportService.prototype as any).exportConfig = mockExportConfig;

      const result = await command.run();

      assert.ok(result);
      assert.strictEqual(result.path, 'test-config.json');
    });

    it('should handle service errors in run method', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ExportCommand(
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

      // Mock service to throw error
      const originalConfigExportService = await import('../../../../../src/services/ConfigExportService.js');
      (originalConfigExportService.ConfigExportService.prototype as any).exportConfig = async () => {
        throw new Error('Service error');
      };

      try {
        await command.run();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok((error as Error).message.includes('Failed to export configuration file'));
      }
    });

    it('should work with JSON flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ExportCommand(
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

      const originalConfigExportService = await import('../../../../../src/services/ConfigExportService.js');
      (originalConfigExportService.ConfigExportService.prototype as any).exportConfig = async () => ({
        status: 'completed',
        jobId: 'job123',
        filePath: 'test.json'
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.path, 'test.json');
    });
  });
});