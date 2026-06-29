import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import UnlinkCommand from '../../../../../src/commands/plauti/deduplicate/sandbox/unlink.js';

describe('plauti:deduplicate:sandbox:unlink', () => {
  it('should use correct command metadata', () => {
    assert.strictEqual(UnlinkCommand.summary, 'Unlink Sandbox');
    assert.ok(UnlinkCommand.flags['target-org']);
    assert.ok(UnlinkCommand.flags['organization-id']);
    assert.ok(UnlinkCommand.flags['plauti-cloud-api-key']);
    assert.ok(UnlinkCommand.flags['json']);
    assert.ok(UnlinkCommand.flags['verbose']);
    assert.strictEqual(UnlinkCommand.flags['json'].default, false);
    assert.strictEqual(UnlinkCommand.flags['verbose'].default, false);
    assert.strictEqual(UnlinkCommand.requiresProject, false);
    assert.ok(Array.isArray(UnlinkCommand.examples));
    assert.ok(UnlinkCommand.examples.some(example => example.includes('sf plauti:deduplicate:sandbox:unlink')));
  });

  it('should validate required flags are present', () => {
    assert.strictEqual(UnlinkCommand.flags['target-org'].required, true);
    assert.strictEqual(UnlinkCommand.flags['organization-id'].required, true);
    assert.strictEqual(UnlinkCommand.flags['plauti-cloud-api-key'].required, true);
  });

  it('should have correct default values for optional flags', () => {
    assert.strictEqual(UnlinkCommand.flags['json'].default, false);
    assert.strictEqual(UnlinkCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    assert.ok(UnlinkCommand.examples.length >= 1);
    assert.ok(UnlinkCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--organization-id') &&
      example.includes('--plauti-cloud-api-key')
    ));
  });

  describe('run() method integration', () => {
    it('should execute run method and return unlink result', async () => {
      const mockOrg = {
        getConnection: () => ({
          sobject: () => ({}),
          version: '54.0'
        })
      };

      const command = new UnlinkCommand(
        ['--target-org', 'prod@example.com', '--organization-id', '00DR0000001ossaMAA', '--plauti-cloud-api-key', 'plauti_123_456'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'organization-id': '00DR0000001ossaMAA',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).unlinkSandbox = async () => ({
        status: 'unlinked'
      });

      const result = await command.run();

      assert.ok(result);
      assert.strictEqual(result.status, 'unlinked');
    });

    it('should handle service errors in run method', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new UnlinkCommand(
        ['--target-org', 'prod@example.com', '--organization-id', '00DR0000001ossaMAA', '--plauti-cloud-api-key', 'plauti_123_456'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'organization-id': '00DR0000001ossaMAA',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).unlinkSandbox = async () => {
        throw new Error('Service error');
      };

      try {
        await command.run();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok((error as Error).message.includes('Failed to unlink sandbox'));
      }
    });

    it('should work with JSON flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new UnlinkCommand(
        ['--target-org', 'prod@example.com', '--organization-id', '00DR0000001ossaMAA', '--plauti-cloud-api-key', 'plauti_123_456', '--json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'organization-id': '00DR0000001ossaMAA',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': true,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).unlinkSandbox = async () => ({
        status: 'unlinked'
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'unlinked');
    });

    it('should work with verbose flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new UnlinkCommand(
        ['--target-org', 'prod@example.com', '--organization-id', '00DR0000001ossaMAA', '--plauti-cloud-api-key', 'plauti_123_456', '--verbose'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'organization-id': '00DR0000001ossaMAA',
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': true
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).unlinkSandbox = async () => ({
        status: 'unlinked'
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'unlinked');
    });
  });
});