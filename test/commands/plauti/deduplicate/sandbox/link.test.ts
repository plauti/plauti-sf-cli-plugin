import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import LinkCommand from '../../../../../src/commands/plauti/deduplicate/sandbox/link.js';

describe('plauti:deduplicate:sandbox:link', () => {
  it('should use correct command metadata', () => {
    assert.strictEqual(LinkCommand.summary, 'Link Sandbox to Production');
    assert.ok(LinkCommand.flags['target-org']);
    assert.ok(LinkCommand.flags['organization-id']);
    assert.ok(LinkCommand.flags['sandbox-username']);
    assert.ok(LinkCommand.flags['sandbox-name']);
    assert.ok(LinkCommand.flags['plauti-cloud-api-key']);
    assert.ok(LinkCommand.flags['json']);
    assert.ok(LinkCommand.flags['verbose']);
    assert.strictEqual(LinkCommand.flags['json'].default, false);
    assert.strictEqual(LinkCommand.flags['verbose'].default, false);
    assert.strictEqual(LinkCommand.requiresProject, false);
    assert.ok(Array.isArray(LinkCommand.examples));
    assert.ok(LinkCommand.examples.some(example => example.includes('sf plauti:deduplicate:sandbox:link')));
  });

  it('should validate required flags are present', () => {
    assert.strictEqual(LinkCommand.flags['target-org'].required, true);
    assert.strictEqual(LinkCommand.flags['sandbox-name'].required, true);
    assert.strictEqual(LinkCommand.flags['plauti-cloud-api-key'].required, true);
  });

  it('should have correct default values for optional flags', () => {
    assert.strictEqual(LinkCommand.flags['json'].default, false);
    assert.strictEqual(LinkCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    assert.ok(LinkCommand.examples.length >= 1);
    assert.ok(LinkCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--sandbox-name') &&
      example.includes('--plauti-cloud-api-key')
    ));
  });

  describe('run() method integration', () => {
    it('should execute run method and return link result', async () => {
      const mockOrg = {
        getConnection: () => ({
          sobject: () => ({}),
          version: '54.0'
        })
      };

      const command = new LinkCommand(
        ['--target-org', 'prod@example.com', '--sandbox-name', 'MySandbox', '--plauti-cloud-api-key', 'plauti_123_456'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'sandbox-name': 'MySandbox',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).linkSandbox = async () => ({
        status: 'linked'
      });

      const result = await command.run();

      assert.ok(result);
      assert.strictEqual(result.status, 'linked');
    });

    it('should handle service errors in run method', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new LinkCommand(
        ['--target-org', 'prod@example.com', '--sandbox-name', 'MySandbox', '--plauti-cloud-api-key', 'plauti_123_456'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'sandbox-name': 'MySandbox',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).linkSandbox = async () => {
        throw new Error('Service error');
      };

      try {
        await command.run();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok((error as Error).message.includes('Failed to link sandbox'));
      }
    });

    it('should work with JSON flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new LinkCommand(
        ['--target-org', 'prod@example.com', '--sandbox-name', 'MySandbox', '--plauti-cloud-api-key', 'plauti_123_456', '--json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'sandbox-name': 'MySandbox',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': true,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).linkSandbox = async () => ({
        status: 'linked'
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'linked');
    });

    it('should work with verbose flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new LinkCommand(
        ['--target-org', 'prod@example.com', '--sandbox-name', 'MySandbox', '--plauti-cloud-api-key', 'plauti_123_456', '--verbose'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'sandbox-name': 'MySandbox',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': true
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).linkSandbox = async () => ({
        status: 'linked'
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'linked');
    });
  });
});