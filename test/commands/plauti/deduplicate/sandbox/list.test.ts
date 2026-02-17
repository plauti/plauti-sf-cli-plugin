import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ListCommand from '../../../../../src/commands/plauti/deduplicate/sandbox/list.js';

describe('plauti:deduplicate:sandbox:list', () => {
  it('should use correct command metadata', () => {
    // Assert
    assert.strictEqual(ListCommand.summary, 'List all sandbox orgs');
    assert.ok(ListCommand.flags['target-org']);
    assert.ok(ListCommand.flags['json']);
    assert.ok(ListCommand.flags['verbose']);
    assert.strictEqual(ListCommand.requiresProject, false);
    assert.ok(Array.isArray(ListCommand.examples));
    assert.ok(ListCommand.examples.some(example => example.includes('sf plauti:deduplicate:sandbox:list')));
  });

  it('should validate required flags are present', () => {
    // Assert flag properties
    assert.strictEqual(ListCommand.flags['target-org'].required, true);
  });

  it('should have correct flag descriptions', () => {
    // Assert flag descriptions exist and are meaningful
    assert.ok(ListCommand.flags['plauti-cloud-api-key'].description);
    assert.ok(ListCommand.flags['json'].description);
    assert.ok(ListCommand.flags['verbose'].description);
  });

  it('should have correct default values for optional flags', () => {
    // Assert default values
    assert.strictEqual(ListCommand.flags['json'].default, false);
    assert.strictEqual(ListCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    // Assert examples are comprehensive
    assert.ok(ListCommand.examples.length >= 2);
    assert.ok(ListCommand.examples.some(example => 
      example.includes('--target-org')
    ));
  });

  it('should include logging utility import', async () => {
    // Read the actual command source to verify logging import
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('./src/commands/plauti/deduplicate/sandbox/list.ts', 'utf-8');
    
    // Assert logging utility is imported
    assert.ok(source.includes('createLogger'));
    assert.ok(source.includes('formatError'));
    assert.ok(source.includes('LoggingUtility'));
  });

  it('should have target-org flag with correct properties', () => {
    // Assert target-org flag configuration
    const targetOrgFlag = ListCommand.flags['target-org'];
    assert.ok(targetOrgFlag.char === 'o');
    assert.strictEqual(targetOrgFlag.required, true);
  });

  it('should have list-specific functionality', () => {
    // Assert list command has distinct functionality
    assert.ok(ListCommand.summary.includes('List'));
    assert.notStrictEqual(ListCommand.summary, 'Link Sandbox');
    assert.notStrictEqual(ListCommand.summary, 'Unlink Sandbox');
  });

  it('should have minimal required flags for listing', () => {
    // Assert list has simple requirements
    const flags = ListCommand.flags;
    const requiredFlagCount = [
      flags['target-org'].required,
      flags['plauti-cloud-api-key'].required,
      flags['json'].required,
      flags['verbose'].required
    ].filter(Boolean).length;
    
    assert.strictEqual(requiredFlagCount, 2); // target-org and plauti-cloud-api-key should be required
    assert.strictEqual(flags['target-org'].required, true);
    assert.strictEqual(flags['plauti-cloud-api-key'].required, true);
    assert.strictEqual(flags['json'].default, false);
    assert.strictEqual(flags['verbose'].default, false);
  });
});