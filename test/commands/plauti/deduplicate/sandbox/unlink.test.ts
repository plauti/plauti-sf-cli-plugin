import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import UnlinkCommand from '../../../../../src/commands/plauti/deduplicate/sandbox/unlink.js';

describe('plauti:deduplicate:sandbox:unlink', () => {
  it('should use correct command metadata', () => {
    // Assert
    assert.strictEqual(UnlinkCommand.summary, 'Unlink Sandbox');
    assert.ok(UnlinkCommand.flags['target-org']);
    assert.ok(UnlinkCommand.flags['json']);
    assert.ok(UnlinkCommand.flags['verbose']);
    assert.strictEqual(UnlinkCommand.requiresProject, false);
    assert.ok(Array.isArray(UnlinkCommand.examples));
    assert.ok(UnlinkCommand.examples.some(example => example.includes('sf plauti:deduplicate:sandbox:unlink')));
  });

  it('should validate required flags are present', () => {
    // Assert flag properties
    assert.strictEqual(UnlinkCommand.flags['target-org'].required, true);
    assert.strictEqual(UnlinkCommand.flags['organization-id'].required, true);
    assert.strictEqual(UnlinkCommand.flags['plauti-cloud-api-key'].required, true);
  });

  it('should have correct flag descriptions', () => {
    // Assert flag descriptions exist and are meaningful
    assert.ok(UnlinkCommand.flags['organization-id'].description);
    assert.ok(UnlinkCommand.flags['plauti-cloud-api-key'].description);
    assert.ok(UnlinkCommand.flags['json'].description);
    assert.ok(UnlinkCommand.flags['verbose'].description);
  });

  it('should have correct default values for optional flags', () => {
    // Assert default values
    assert.strictEqual(UnlinkCommand.flags['json'].default, false);
    assert.strictEqual(UnlinkCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    // Assert examples are comprehensive
    assert.ok(UnlinkCommand.examples.length >= 2);
    assert.ok(UnlinkCommand.examples.some(example => 
      example.includes('--target-org')
    ));
  });

  it('should include logging utility import', async () => {
    // Read the actual command source to verify logging import
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('./src/commands/plauti/deduplicate/sandbox/unlink.ts', 'utf-8');
    
    // Assert logging utility is imported
    assert.ok(source.includes('createLogger'));
    assert.ok(source.includes('formatError'));
    assert.ok(source.includes('LoggingUtility'));
  });

  it('should have target-org flag with correct properties', () => {
    // Assert target-org flag configuration
    const targetOrgFlag = UnlinkCommand.flags['target-org'];
    assert.ok(targetOrgFlag.char === 'o');
    assert.strictEqual(targetOrgFlag.required, true);
  });

  it('should have unlink-specific functionality', () => {
    // Assert unlink command has distinct functionality
    assert.ok(UnlinkCommand.summary.includes('Unlink'));
    assert.notStrictEqual(UnlinkCommand.summary, 'Link Sandbox');
  });

  it('should have required flags for unlink operation', () => {
    // Assert unlink has necessary requirements for unlinking
    const flags = UnlinkCommand.flags;
    const requiredFlagCount = [
      flags['target-org'].required,
      flags['organization-id'].required,
      flags['plauti-cloud-api-key'].required,
      flags['json'].required,
      flags['verbose'].required
    ].filter(Boolean).length;
    
    assert.strictEqual(requiredFlagCount, 3); // target-org, organization-id, plauti-cloud-api-key should be required
    assert.strictEqual(flags['target-org'].required, true);
    assert.strictEqual(flags['organization-id'].required, true);
    assert.strictEqual(flags['plauti-cloud-api-key'].required, true);
    assert.strictEqual(flags['json'].default, false);
    assert.strictEqual(flags['verbose'].default, false);
  });
});