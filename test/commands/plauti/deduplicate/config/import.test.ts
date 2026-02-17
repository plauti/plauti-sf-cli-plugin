import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ImportCommand from '../../../../../src/commands/plauti/deduplicate/config/import.js';

describe('plauti:deduplicate:config:import', () => {
  it('should use correct command metadata', () => {
    // Assert
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
    // Assert flag properties
    assert.strictEqual(ImportCommand.flags['target-org'].required, true);
    assert.strictEqual(ImportCommand.flags['file'].required, true);
  });

  it('should have correct flag descriptions', () => {
    // Assert flag descriptions exist and are meaningful
    assert.ok(ImportCommand.flags['file'].description);
    assert.ok(ImportCommand.flags['poll-interval'].description);
    assert.ok(ImportCommand.flags['json'].description);
    assert.ok(ImportCommand.flags['verbose'].description);
  });

  it('should have correct default values for optional flags', () => {
    // Assert default values
    assert.strictEqual(ImportCommand.flags['poll-interval'].default, 3);
    assert.strictEqual(ImportCommand.flags['json'].default, false);
    assert.strictEqual(ImportCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    // Assert examples are comprehensive
    assert.ok(ImportCommand.examples.length >= 2);
    assert.ok(ImportCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--file')
    ));
  });

  it('should include logging utility import', async () => {
    // Read the actual command source to verify logging import
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('./src/commands/plauti/deduplicate/config/import.ts', 'utf-8');
    
    // Assert logging utility is imported
    assert.ok(source.includes('createLogger'));
    assert.ok(source.includes('formatError'));
    assert.ok(source.includes('LoggingUtility'));
  });

  it('should have poll-interval flag with correct properties', () => {
    // Assert poll-interval flag configuration
    const pollIntervalFlag = ImportCommand.flags['poll-interval'];
    assert.ok(pollIntervalFlag.description && (pollIntervalFlag.description.includes('interval') || pollIntervalFlag.description.includes('poll')));
    assert.strictEqual(pollIntervalFlag.default, 3);
  });

  it('should have target-org flag with correct properties', () => {
    // Assert target-org flag configuration
    const targetOrgFlag = ImportCommand.flags['target-org'];
    assert.ok(targetOrgFlag.char === 'o');
    assert.strictEqual(targetOrgFlag.required, true);
  });

  it('should have file flag with correct properties', () => {
    // Assert file flag configuration
    const fileFlag = ImportCommand.flags['file'];
    assert.ok(fileFlag.description && (fileFlag.description.includes('file') || fileFlag.description.includes('File')));
    assert.strictEqual(fileFlag.required, true);
  });

  it('should have import-specific functionality', () => {
    // Assert import command has distinct functionality from export
    assert.notStrictEqual(ImportCommand.summary, 'Export Plauti Deduplicate configuration');
    assert.ok(ImportCommand.summary.includes('Import'));
  });
});