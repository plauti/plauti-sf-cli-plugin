import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ExportCommand from '../../../../../src/commands/plauti/deduplicate/config/export.js';

describe('plauti:deduplicate:config:export', () => {
  it('should use correct command metadata', () => {
    // Assert
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
    // Assert flag properties
    assert.strictEqual(ExportCommand.flags['target-org'].required, true);
    assert.strictEqual(ExportCommand.flags['file'].required, true);
  });

  it('should have correct flag descriptions', () => {
    // Assert flag descriptions exist and are meaningful
    assert.ok(ExportCommand.flags['file'].description);
    assert.ok(ExportCommand.flags['poll-interval'].description);
    assert.ok(ExportCommand.flags['json'].description);
    assert.ok(ExportCommand.flags['verbose'].description);
  });

  it('should have correct default values for optional flags', () => {
    // Assert default values
    assert.strictEqual(ExportCommand.flags['poll-interval'].default, 3);
    assert.strictEqual(ExportCommand.flags['json'].default, false);
    assert.strictEqual(ExportCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    // Assert examples are comprehensive
    assert.ok(ExportCommand.examples.length >= 2);
    assert.ok(ExportCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--file')
    ));
  });

  it('should include logging utility import', async () => {
    // Read the actual command source to verify logging import
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('./src/commands/plauti/deduplicate/config/export.ts', 'utf-8');
    
    // Assert logging utility is imported
    assert.ok(source.includes('createLogger'));
    assert.ok(source.includes('formatError'));
    assert.ok(source.includes('LoggingUtility'));
  });

  it('should have poll-interval flag with correct properties', () => {
    // Assert poll-interval flag configuration
    const pollIntervalFlag = ExportCommand.flags['poll-interval'];
    assert.ok(pollIntervalFlag.description && (pollIntervalFlag.description.includes('interval') || pollIntervalFlag.description.includes('poll')));
    assert.strictEqual(pollIntervalFlag.default, 3);
  });

  it('should have target-org flag with correct properties', () => {
    // Assert target-org flag configuration
    const targetOrgFlag = ExportCommand.flags['target-org'];
    assert.ok(targetOrgFlag.char === 'o');
    assert.strictEqual(targetOrgFlag.required, true);
  });

  it('should have file flag with correct properties', () => {
    // Assert file flag configuration
    const fileFlag = ExportCommand.flags['file'];
    assert.ok(fileFlag.description && (fileFlag.description.includes('file') || fileFlag.description.includes('File')));
    assert.strictEqual(fileFlag.required, true);
  });
});