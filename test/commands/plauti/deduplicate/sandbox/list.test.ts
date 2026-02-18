import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import ListCommand from '../../../../../src/commands/plauti/deduplicate/sandbox/list.js';

describe('plauti:deduplicate:sandbox:list', () => {
  it('should use correct command metadata', () => {
    assert.strictEqual(ListCommand.summary, 'List all sandbox orgs');
    assert.ok(ListCommand.flags['target-org']);
    assert.ok(ListCommand.flags['plauti-cloud-api-key']);
    assert.ok(ListCommand.flags['json']);
    assert.ok(ListCommand.flags['verbose']);
    assert.strictEqual(ListCommand.flags['json'].default, false);
    assert.strictEqual(ListCommand.flags['verbose'].default, false);
    assert.strictEqual(ListCommand.requiresProject, false);
    assert.ok(Array.isArray(ListCommand.examples));
    assert.ok(ListCommand.examples.some(example => example.includes('sf plauti:deduplicate:sandbox:list')));
  });

  it('should validate required flags are present', () => {
    assert.strictEqual(ListCommand.flags['target-org'].required, true);
    assert.strictEqual(ListCommand.flags['plauti-cloud-api-key'].required, true);
  });

  it('should have correct default values for optional flags', () => {
    assert.strictEqual(ListCommand.flags['json'].default, false);
    assert.strictEqual(ListCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    assert.ok(ListCommand.examples.length >= 1);
    assert.ok(ListCommand.examples.some(example => 
      example.includes('--target-org') && 
      example.includes('--plauti-cloud-api-key')
    ));
  });

  describe('run() method integration', () => {
    it('should execute run method and return list result', async () => {
      const mockOrg = {
        getConnection: () => ({
          sobject: () => ({}),
          version: '54.0'
        })
      };

      const command = new ListCommand(
        ['--target-org', 'prod@example.com', '--plauti-cloud-api-key', 'plauti_123_456'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).listSandboxes = async () => ({
        status: 'success',
        sandboxes: [
          { id: 'sb1', name: 'Sandbox1' },
          { id: 'sb2', name: 'Sandbox2' }
        ]
      });

      const result = await command.run();

      assert.ok(result);
      assert.strictEqual(result.status, 'success');
      assert.ok(Array.isArray(result.sandboxes));
      assert.strictEqual((result.sandboxes as any[]).length, 2);
    });

    it('should handle service errors in run method', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ListCommand(
        ['--target-org', 'prod@example.com', '--plauti-cloud-api-key', 'plauti_123_456'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).listSandboxes = async () => {
        throw new Error('Service error');
      };

      try {
        await command.run();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok((error as Error).message.includes('Failed to get linked sandboxes'));
      }
    });

    it('should work with JSON flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ListCommand(
        ['--target-org', 'prod@example.com', '--plauti-cloud-api-key', 'plauti_123_456', '--json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': true,
          'verbose': false
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).listSandboxes = async () => ({
        status: 'success',
        sandboxes: []
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'success');
      assert.ok(Array.isArray(result.sandboxes));
    });

    it('should work with verbose flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new ListCommand(
        ['--target-org', 'prod@example.com', '--plauti-cloud-api-key', 'plauti_123_456', '--verbose'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'plauti-cloud-api-key': 'plauti_123_456',
          'json': false,
          'verbose': true
        }
      });

      const originalSandboxService = await import('../../../../../src/services/SandboxManagementService.js');
      (originalSandboxService.SandboxManagementService.prototype as any).listSandboxes = async () => ({
        status: 'success',
        sandboxes: [{ id: 'sb1', name: 'TestSandbox' }]
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'success');
      assert.ok(Array.isArray(result.sandboxes));
    });
  });
});