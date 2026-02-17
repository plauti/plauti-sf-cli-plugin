import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import RefreshCommand from '../../../../../src/commands/plauti/deduplicate/license/refresh.js';

describe('plauti:deduplicate:license:refresh', () => {
  it('should use correct command metadata', () => {
    // Assert
    assert.strictEqual(RefreshCommand.summary, 'Refresh Plauti Deduplicate for Salesforce license');
    assert.ok(RefreshCommand.flags['target-org']);
    assert.ok(RefreshCommand.flags['json']);
    assert.ok(RefreshCommand.flags['verbose']);
    assert.strictEqual(RefreshCommand.requiresProject, false);
    assert.ok(Array.isArray(RefreshCommand.examples));
    assert.ok(RefreshCommand.examples.some(example => example.includes('sf plauti:deduplicate:license:refresh')));
  });

  it('should validate required flags are present', () => {
    // Assert flag properties
    assert.strictEqual(RefreshCommand.flags['target-org'].required, true);
  });

  it('should have correct flag descriptions', () => {
    // Assert flag descriptions exist and are meaningful
    assert.ok(RefreshCommand.flags['json'].description);
    assert.ok(RefreshCommand.flags['verbose'].description);
  });

  it('should have correct default values for optional flags', () => {
    // Assert default values
    assert.strictEqual(RefreshCommand.flags['json'].default, false);
    assert.strictEqual(RefreshCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    // Assert examples are comprehensive
    assert.ok(RefreshCommand.examples.length >= 2);
    assert.ok(RefreshCommand.examples.some(example => 
      example.includes('--target-org')
    ));
  });

  it('should include logging utility import', async () => {
    // Read the actual command source to verify logging import
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('./src/commands/plauti/deduplicate/license/refresh.ts', 'utf-8');
    
    // Assert logging utility is imported
    assert.ok(source.includes('createLogger'));
    assert.ok(source.includes('formatError'));
    assert.ok(source.includes('LoggingUtility'));
  });

  it('should have target-org flag with correct properties', () => {
    // Assert target-org flag configuration
    const targetOrgFlag = RefreshCommand.flags['target-org'];
    assert.ok(targetOrgFlag.char === 'o');
    assert.strictEqual(targetOrgFlag.required, true);
  });

  it('should have license-specific functionality', () => {
    // Assert license refresh command has distinct functionality
    assert.ok(RefreshCommand.summary.includes('license') || RefreshCommand.summary.includes('Refresh'));
    assert.notStrictEqual(RefreshCommand.summary, 'Link Sandbox');
    assert.notStrictEqual(RefreshCommand.summary, 'List Sandboxes');
  });

  it('should have minimal required flags for license operations', () => {
    // Assert license refresh has simple requirements
    const flags = RefreshCommand.flags;
    const requiredFlagCount = [
      flags['target-org'].required,
      flags['json'].required,
      flags['verbose'].required
    ].filter(Boolean).length;
    
    assert.strictEqual(requiredFlagCount, 1); // Only target-org should be required
    assert.strictEqual(flags['target-org'].required, true);
    assert.strictEqual(flags['json'].default, false);
    assert.strictEqual(flags['verbose'].default, false);
  });

  it('should have license-related command structure', () => {
    // Assert command structure follows license pattern
    assert.ok(RefreshCommand.summary.toLowerCase().includes('license') || 
             RefreshCommand.summary.toLowerCase().includes('refresh'));
    assert.ok(RefreshCommand.examples.some(example => 
      example.includes('plauti:deduplicate:license:refresh')
    ));
  });
});