import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { SandboxManagementService } from '../../src/services/SandboxManagementService.js';

describe('SandboxManagementService', () => {
  it('should have correct constructor parameters', () => {
    const mockPlautiCloudClient = {
      linkSandbox: () => Promise.resolve({ status: 'done' }),
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: () => Promise.resolve('org123'),
      getUsername: () => Promise.resolve('user@test.com'),
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    assert.ok(service);
    assert.ok(typeof service.linkSandbox === 'function');
    assert.ok(typeof service.listSandboxes === 'function');
    assert.ok(typeof service.unlinkSandbox === 'function');
  });

  it('should successfully link sandbox with mocked dependencies', async () => {
    let linkSandboxCalled = false;
    let getOrgIdCalled = false;
    let getUsernameCalled = false;

    const mockPlautiCloudClient = {
      linkSandbox: (request: any) => {
        assert.ok(request.sandboxOrgId);
        assert.ok(request.prodOrgId);
        assert.ok(request.username);
        linkSandboxCalled = true;
        return Promise.resolve({ status: 'done' });
      },
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: (org: any) => {
        assert.ok(org);
        getOrgIdCalled = true;
        return Promise.resolve('org123');
      },
      getUsername: (org: any) => {
        assert.ok(org);
        getUsernameCalled = true;
        return Promise.resolve('sandbox@test.com');
      },
      getOrgIdFromUsername: () => Promise.resolve('org456')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    const result = await service.linkSandbox({
      org: {} as any,
      organizationId: 'sandbox123',
      sandboxName: 'Test Sandbox',
      plautiCloudApiKey: 'test-key'
    });

    // Verify all mocked methods were called
    assert.ok(getOrgIdCalled, 'getOrgId should be called');
    assert.ok(getUsernameCalled, 'getUsername should be called');
    assert.ok(linkSandboxCalled, 'linkSandbox should be called');

    // Verify result structure
    assert.strictEqual(result.status, 'done');
  });

  it('should successfully list sandboxes with mocked dependencies', async () => {
    let listSandboxesCalled = false;
    let getOrgIdCalled = false;

    const mockSandboxData = [
      { id: 'sandbox1', name: 'Test Sandbox 1', status: 'Active' },
      { id: 'sandbox2', name: 'Test Sandbox 2', status: 'Inactive' }
    ];

    const mockPlautiCloudClient = {
      linkSandbox: () => Promise.resolve({ status: 'done' }),
      listSandboxes: (orgId: string, apiKey: string) => {
        assert.strictEqual(orgId, 'prodOrg123');
        assert.ok(apiKey);
        listSandboxesCalled = true;
        return Promise.resolve(mockSandboxData);
      },
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: (org: any) => {
        assert.ok(org);
        getOrgIdCalled = true;
        return Promise.resolve('prodOrg123');
      },
      getUsername: () => Promise.resolve('user@test.com'),
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    const result = await service.listSandboxes({
      org: {} as any,
      plautiCloudApiKey: 'test-key'
    });

    // Verify all mocked methods were called
    assert.ok(getOrgIdCalled, 'getOrgId should be called');
    assert.ok(listSandboxesCalled, 'listSandboxes should be called');

    // Verify result structure
    assert.strictEqual(result.status, 'done');
    assert.ok(Array.isArray(result.sandboxes));
    assert.strictEqual(result.sandboxes.length, 2);
    assert.strictEqual(result.sandboxes[0].id, 'sandbox1');
  });

  it('should successfully unlink sandbox with mocked dependencies', async () => {
    let unlinkSandboxCalled = false;
    let getOrgIdCalled = false;

    const mockPlautiCloudClient = {
      linkSandbox: () => Promise.resolve({ status: 'done' }),
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: (sandboxId: string, prodId: string, apiKey: string) => {
        assert.strictEqual(sandboxId, 'sandbox123');
        assert.strictEqual(prodId, 'prodOrg456');
        assert.ok(apiKey);
        unlinkSandboxCalled = true;
        return Promise.resolve({ status: 'done' });
      }
    };
    
    const mockOrgInfoClient = {
      getOrgId: (org: any) => {
        assert.ok(org);
        getOrgIdCalled = true;
        return Promise.resolve('prodOrg456');
      },
      getUsername: () => Promise.resolve('user@test.com'),
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    const result = await service.unlinkSandbox({
      org: {} as any,
      organizationId: 'sandbox123',
      plautiCloudApiKey: 'test-key'
    });

    // Verify all mocked methods were called
    assert.ok(getOrgIdCalled, 'getOrgId should be called');
    assert.ok(unlinkSandboxCalled, 'unlinkSandbox should be called');

    // Verify result structure
    assert.strictEqual(result.status, 'done');
  });

  it('should handle link sandbox failure', async () => {
    const mockPlautiCloudClient = {
      linkSandbox: () => Promise.reject(new Error('Failed to connect to Plauti Cloud')),
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: () => Promise.resolve('org123'),
      getUsername: () => Promise.resolve('user@test.com'),
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    try {
      await service.linkSandbox({
        org: {} as any,
        organizationId: 'sandbox123',
        sandboxName: 'Test Sandbox',
        plautiCloudApiKey: 'test-key'
      });
      assert.fail('Should have thrown an error for link failure');
    } catch (error) {
      assert.ok((error as Error).message.includes('Failed to connect'));
    }
  });

  it('should handle org info retrieval failure', async () => {
    const mockPlautiCloudClient = {
      linkSandbox: () => Promise.resolve({ status: 'done' }),
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: () => Promise.reject(new Error('Unable to retrieve org ID')),
      getUsername: () => Promise.resolve('user@test.com'),
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    try {
      await service.linkSandbox({
        org: {} as any,
        organizationId: 'sandbox123',
        sandboxName: 'Test Sandbox',
        plautiCloudApiKey: 'test-key'
      });
      assert.fail('Should have thrown an error for org info failure');
    } catch (error) {
      assert.ok((error as Error).message.includes('Unable to retrieve org ID'));
    }
  });

  it('should handle empty sandbox list', async () => {
    const mockPlautiCloudClient = {
      linkSandbox: () => Promise.resolve({ status: 'done' }),
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: () => Promise.resolve('emptyOrg123'),
      getUsername: () => Promise.resolve('user@test.com'),
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    const result = await service.listSandboxes({
      org: {} as any,
      plautiCloudApiKey: 'test-key'
    });

    // Verify empty result
    assert.strictEqual(result.status, 'done');
    assert.ok(Array.isArray(result.sandboxes));
    assert.strictEqual(result.sandboxes.length, 0);
  });

  it('should validate business logic flow for linking', async () => {
    const callOrder: string[] = [];

    const mockPlautiCloudClient = {
      linkSandbox: (request: any) => {
        callOrder.push('linkSandbox');
        return Promise.resolve({ status: 'done' });
      },
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: (org: any) => {
        callOrder.push('getOrgId');
        return Promise.resolve('org456');
      },
      getUsername: (org: any) => {
        callOrder.push('getUsername');
        return Promise.resolve('test@example.com');
      },
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    await service.linkSandbox({
      org: {} as any,
      organizationId: 'sandbox123',
      sandboxName: 'Test Sandbox',
      plautiCloudApiKey: 'test-key'
    });

    // Verify the correct business logic flow (org info first, then link)
    assert.ok(callOrder.includes('getOrgId'));
    assert.ok(callOrder.includes('getUsername'));
    assert.ok(callOrder.includes('linkSandbox'));
    assert.ok(callOrder.indexOf('getOrgId') < callOrder.indexOf('linkSandbox'));
  });

  it('should handle authentication errors', async () => {
    const mockPlautiCloudClient = {
      linkSandbox: () => Promise.reject(new Error('Unauthorized: Invalid API key')),
      listSandboxes: () => Promise.resolve([]),
      unlinkSandbox: () => Promise.resolve({ status: 'done' })
    };
    
    const mockOrgInfoClient = {
      getOrgId: () => Promise.resolve('org123'),
      getUsername: () => Promise.resolve('user@test.com'),
      getOrgIdFromUsername: () => Promise.resolve('org123')
    };

    const service = new SandboxManagementService(mockPlautiCloudClient, mockOrgInfoClient);
    
    try {
      await service.linkSandbox({
        org: {} as any,
        organizationId: 'sandbox123',
        sandboxName: 'Test Sandbox',
        plautiCloudApiKey: 'test-key'
      });
      assert.fail('Should have thrown an error for authentication failure');
    } catch (error) {
      assert.ok((error as Error).message.includes('Unauthorized'));
    }
  });
});
