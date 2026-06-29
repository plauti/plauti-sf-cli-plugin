import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import RefreshCommand from '../../../../../src/commands/plauti/deduplicate/license/refresh.js';

describe('plauti:deduplicate:license:refresh', () => {
  it('should use correct command metadata', () => {
    assert.strictEqual(RefreshCommand.summary, 'Refresh Plauti Deduplicate for Salesforce license');
    assert.ok(RefreshCommand.flags['target-org']);
    assert.ok(RefreshCommand.flags['json']);
    assert.ok(RefreshCommand.flags['verbose']);
    assert.strictEqual(RefreshCommand.flags['json'].default, false);
    assert.strictEqual(RefreshCommand.flags['verbose'].default, false);
    assert.strictEqual(RefreshCommand.requiresProject, false);
    assert.ok(Array.isArray(RefreshCommand.examples));
    assert.ok(RefreshCommand.examples.some(example => example.includes('sf plauti:deduplicate:license:refresh')));
  });

  it('should validate required flags are present', () => {
    assert.strictEqual(RefreshCommand.flags['target-org'].required, true);
  });

  it('should have correct default values for optional flags', () => {
    assert.strictEqual(RefreshCommand.flags['json'].default, false);
    assert.strictEqual(RefreshCommand.flags['verbose'].default, false);
  });

  it('should have meaningful command examples', () => {
    assert.ok(RefreshCommand.examples.length >= 1);
    assert.ok(RefreshCommand.examples.some(example => 
      example.includes('--target-org')
    ));
  });

  describe('run() method integration', () => {
    it('should execute run method and return result', async () => {
      const mockOrg = {
        getConnection: () => ({
          sobject: () => ({}),
          version: '54.0'
        })
      };

      const command = new RefreshCommand(
        ['--target-org', 'test@example.com'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'json': false,
          'verbose': false
        }
      });

      const originalLicenseService = await import('../../../../../src/services/LicenseService.js');
      (originalLicenseService.LicenseService.prototype as any).refreshLicense = async () => ({
        status: 'success'
      });

      const result = await command.run();

      assert.ok(result);
      assert.strictEqual(result.status, 'success');
    });

    it('should handle service errors in run method', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new RefreshCommand(
        ['--target-org', 'test@example.com'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'json': false,
          'verbose': false
        }
      });

      const originalLicenseService = await import('../../../../../src/services/LicenseService.js');
      (originalLicenseService.LicenseService.prototype as any).refreshLicense = async () => {
        throw new Error('Service error');
      };

      try {
        await command.run();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok((error as Error).message.includes('Failed to refresh Plauti Deduplicate for Salesforce license'));
      }
    });

    it('should work with JSON flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new RefreshCommand(
        ['--target-org', 'test@example.com', '--json'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'json': true,
          'verbose': false
        }
      });

      const originalLicenseService = await import('../../../../../src/services/LicenseService.js');
      (originalLicenseService.LicenseService.prototype as any).refreshLicense = async () => ({
        status: 'success'
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'success');
    });

    it('should work with verbose flag enabled', async () => {
      const mockOrg = {
        getConnection: () => ({ version: '54.0' })
      };

      const command = new RefreshCommand(
        ['--target-org', 'test@example.com', '--verbose'],
        {} as any
      );

      (command as any).parse = async () => ({
        flags: {
          'target-org': mockOrg,
          'json': false,
          'verbose': true
        }
      });

      const originalLicenseService = await import('../../../../../src/services/LicenseService.js');
      (originalLicenseService.LicenseService.prototype as any).refreshLicense = async () => ({
        status: 'success'
      });

      const result = await command.run();
      
      assert.ok(result);
      assert.strictEqual(result.status, 'success');
    });
  });
});