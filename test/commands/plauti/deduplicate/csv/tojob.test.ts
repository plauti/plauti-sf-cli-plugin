import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ToJobCommand from '../../../../../src/commands/plauti/deduplicate/csv/tojob.js';

describe('plauti:deduplicate:csv:tojob', () => {
  it('should use correct command metadata', () => {
    assert.strictEqual(ToJobCommand.summary, 'Create A Plauti Deduplicate Job based on a CSV File');
    assert.ok(ToJobCommand.flags['target-org']);
    assert.ok(ToJobCommand.flags['file']);
    assert.ok(ToJobCommand.flags['source-object']);
    assert.ok(ToJobCommand.flags['match-object']);
    assert.ok(ToJobCommand.flags['delimiter']);
    assert.ok(ToJobCommand.flags['json']);
    assert.strictEqual(ToJobCommand.flags['delimiter'].default, ',');
    assert.strictEqual(ToJobCommand.requiresProject, false);
    assert.ok(Array.isArray(ToJobCommand.examples));
    assert.ok(ToJobCommand.examples.some(example => example.includes('sf plauti:deduplicate:csv:tojob')));
  });

  it('should validate required flags are present', () => {
    assert.strictEqual(ToJobCommand.flags['target-org'].required, true);
    assert.strictEqual(ToJobCommand.flags['file'].required, true);
    assert.strictEqual(ToJobCommand.flags['source-object'].required, true);
    assert.strictEqual(ToJobCommand.flags['match-object'].required, true);
  });

  it('should have correct default values for optional flags', () => {
    assert.strictEqual(ToJobCommand.flags['delimiter'].default, ',');
    assert.strictEqual(ToJobCommand.flags['json'].default, false);
  });

  it('should have meaningful command examples', () => {
    assert.ok(ToJobCommand.examples.length >= 2);
    assert.ok(ToJobCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--file') &&
      example.includes('--source-object') &&
      example.includes('--match-object')
    ));
  });

  describe('run() method integration', () => {
    it('should execute run method and return job result', async () => {
      const mockOrg = {
        getConnection: () => ({
          sobject: () => ({}),
          version: '54.0'
        })
      };

      const command = new ToJobCommand(
        ['--target-org', 'test@example.com', '--file', 'test.csv', '--source-object', '001', '--match-object', '001'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test.csv',
          'source-object': '001',
          'match-object': '001',
          'delimiter': ',',
          'json': false
        }
      });

      const originalDuplicateJobService = await import('../../../../../src/services/DuplicateJobService.js');
      (originalDuplicateJobService.DuplicateJobService.prototype as any).createJobFromCsv = async () => ({
        jobId: 'job123',
        successCount: 100,
        errorCount: 0
      });

      const result = await command.run();

      assert.ok(result);
      assert.strictEqual(result, '{}');
    });

    it('should handle service errors in run method', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ToJobCommand(
        ['--target-org', 'test@example.com', '--file', 'test.csv', '--source-object', '001', '--match-object', '001'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test.csv',
          'source-object': '001',
          'match-object': '001',
          'delimiter': ',',
          'json': false
        }
      });

      const originalDuplicateJobService = await import('../../../../../src/services/DuplicateJobService.js');
      (originalDuplicateJobService.DuplicateJobService.prototype as any).createJobFromCsv = async () => {
        throw new Error('Service error');
      };

      try {
        await command.run();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok((error as Error).message.includes('Failed to create job from CSV'));
      }
    });

    it('should work with custom delimiter', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ToJobCommand(
        ['--target-org', 'test@example.com', '--file', 'test.csv', '--source-object', '001', '--match-object', '001', '--delimiter', ';'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test.csv',
          'source-object': '001',
          'match-object': '001',
          'delimiter': ';',
          'json': false
        }
      });

      const originalDuplicateJobService = await import('../../../../../src/services/DuplicateJobService.js');
      (originalDuplicateJobService.DuplicateJobService.prototype as any).createJobFromCsv = async () => ({
        jobId: 'job123',
        successCount: 50,
        errorCount: 0
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result, '{}');
    });

    it('should work with JSON flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ToJobCommand(
        ['--target-org', 'test@example.com', '--file', 'test.csv', '--source-object', '001', '--match-object', '001', '--json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'file': 'test.csv',
          'source-object': '001',
          'match-object': '001',
          'delimiter': ',',
          'json': true
        }
      });

      const originalDuplicateJobService = await import('../../../../../src/services/DuplicateJobService.js');
      (originalDuplicateJobService.DuplicateJobService.prototype as any).createJobFromCsv = async () => ({
        jobId: 'job123',
        successCount: 75,
        errorCount: 0
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result, '{}');
    });
  });
});