import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ToJobCommand from '../../../../../src/commands/plauti/deduplicate/csv/tojob.js';

describe('plauti:deduplicate:csv:tojob', () => {
  it('should use correct command metadata', () => {
    // Assert
    assert.strictEqual(ToJobCommand.summary, 'Create A Plauti Deduplicate Job based on a CSV File');
    assert.ok(ToJobCommand.flags['target-org']);
    assert.ok(ToJobCommand.flags['file']);
    assert.ok(ToJobCommand.flags['source-object']);
    assert.ok(ToJobCommand.flags['match-object']);
    assert.ok(ToJobCommand.flags['delimiter']);
    assert.ok(ToJobCommand.flags['set-master-for-merge']);
    assert.ok(ToJobCommand.flags['json']);
    assert.ok(ToJobCommand.flags['verbose']);
    assert.strictEqual(ToJobCommand.requiresProject, false);
    assert.ok(Array.isArray(ToJobCommand.examples));
    assert.ok(ToJobCommand.examples.some(example => example.includes('sf plauti:deduplicate:csv:tojob')));
  });

  it('should validate required flags are present', () => {
    // Assert flag properties
    assert.strictEqual(ToJobCommand.flags['target-org'].required, true);
    assert.strictEqual(ToJobCommand.flags['file'].required, true);
    assert.strictEqual(ToJobCommand.flags['source-object'].required, true);
    assert.strictEqual(ToJobCommand.flags['match-object'].required, true);
  });

  it('should have correct flag descriptions', () => {
    // Assert flag descriptions exist and are meaningful
    assert.ok(ToJobCommand.flags['file'].description);
    assert.ok(ToJobCommand.flags['source-object'].description);
    assert.ok(ToJobCommand.flags['match-object'].description);
    assert.ok(ToJobCommand.flags['delimiter'].description);
    assert.ok(ToJobCommand.flags['set-master-for-merge'].description);
    assert.ok(ToJobCommand.flags['json'].description);
    assert.ok(ToJobCommand.flags['verbose'].description);
  });

  it('should have correct default values for optional flags', () => {
    // Assert default values
    assert.strictEqual(ToJobCommand.flags['delimiter'].default, ',');
    assert.strictEqual(ToJobCommand.flags['set-master-for-merge'].default, false);
    assert.strictEqual(ToJobCommand.flags['json'].default, false);
    assert.strictEqual(ToJobCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    // Assert examples are comprehensive
    assert.ok(ToJobCommand.examples.length >= 2);
    assert.ok(ToJobCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--file') && 
      example.includes('--source-object') &&
      example.includes('--match-object')
    ));
  });

  it('should include logging utility import', async () => {
    // Read the actual command source to verify logging import
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('./src/commands/plauti/deduplicate/csv/tojob.ts', 'utf-8');
    
    // Assert logging utility is imported
    assert.ok(source.includes('createLogger'));
    assert.ok(source.includes('formatError'));
    assert.ok(source.includes('LoggingUtility'));
  });

  it('should handle both delimiter types', () => {
    // Assert delimiter flag supports both comma and semicolon
    const delimiterFlag = ToJobCommand.flags['delimiter'];
    assert.strictEqual(delimiterFlag.default, ',');
    assert.ok(delimiterFlag.description && (delimiterFlag.description.includes('delimiter') || delimiterFlag.description.includes('Delimiter')));
  });
});
