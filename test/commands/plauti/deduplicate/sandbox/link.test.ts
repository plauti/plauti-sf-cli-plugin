import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import LinkCommand from '../../../../../src/commands/plauti/deduplicate/sandbox/link.js';

describe('plauti:deduplicate:sandbox:link', () => {
  it('should use correct command metadata', () => {
    // Assert
    assert.strictEqual(LinkCommand.summary, 'Link Sandbox to Production');
    assert.ok(LinkCommand.flags['target-org']);
    assert.ok(LinkCommand.flags['organization-id']);
    assert.ok(LinkCommand.flags['plauti-cloud-api-key']);
    assert.ok(LinkCommand.flags['json']);
    assert.ok(LinkCommand.flags['verbose']);
    assert.strictEqual(LinkCommand.requiresProject, false);
    assert.ok(Array.isArray(LinkCommand.examples));
    assert.ok(LinkCommand.examples.some(example => example.includes('sf plauti:deduplicate:sandbox:link')));
  });

  it('should validate required flags are present', () => {
    // Assert flag properties
    assert.strictEqual(LinkCommand.flags['target-org'].required, true);
    assert.strictEqual(LinkCommand.flags['sandbox-name'].required, true);
    assert.strictEqual(LinkCommand.flags['plauti-cloud-api-key'].required, true);
  });

  it('should have correct flag descriptions', () => {
    // Assert flag descriptions exist and are meaningful
    assert.ok(LinkCommand.flags['organization-id'].description);
    assert.ok(LinkCommand.flags['sandbox-name'].description);
    assert.ok(LinkCommand.flags['plauti-cloud-api-key'].description);
    assert.ok(LinkCommand.flags['json'].description);
    assert.ok(LinkCommand.flags['verbose'].description);
  });

  it('should have correct default values for optional flags', () => {
    // Assert default values
    assert.strictEqual(LinkCommand.flags['json'].default, false);
    assert.strictEqual(LinkCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    // Assert examples are comprehensive
    assert.ok(LinkCommand.examples.length >= 2);
    assert.ok(LinkCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--organization-id') &&
      example.includes('--plauti-cloud-api-key')
    ));
  });

  it('should include logging utility import', async () => {
    // Read the actual command source to verify logging import
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('./src/commands/plauti/deduplicate/sandbox/link.ts', 'utf-8');
    
    // Assert logging utility is imported
    assert.ok(source.includes('createLogger'));
    assert.ok(source.includes('formatError'));
    assert.ok(source.includes('LoggingUtility'));
  });

  it('should have organization-id flag with correct properties', () => {
    // Assert organization-id flag configuration
    const orgIdFlag = LinkCommand.flags['organization-id'];
    assert.ok(orgIdFlag.description && orgIdFlag.description.includes('Organization'));
    assert.strictEqual(orgIdFlag.required, false);
  });

  it('should have target-org flag with correct properties', () => {
    // Assert target-org flag configuration
    const targetOrgFlag = LinkCommand.flags['target-org'];
    assert.ok(targetOrgFlag.char === 'o');
    assert.strictEqual(targetOrgFlag.required, true);
  });

  it('should have plauti-cloud-api-key flag with correct properties', () => {
    // Assert plauti-cloud-api-key flag configuration
    const apiKeyFlag = LinkCommand.flags['plauti-cloud-api-key'];
    assert.ok(apiKeyFlag.description && apiKeyFlag.description.includes('Api Key'));
    assert.strictEqual(apiKeyFlag.required, true);
  });

  it('should have link-specific functionality', () => {
    // Assert link command has distinct functionality
    assert.ok(LinkCommand.summary.includes('Link'));
    assert.notStrictEqual(LinkCommand.summary, 'Unlink Sandbox');
  });
});