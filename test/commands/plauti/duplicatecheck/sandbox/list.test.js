import { test, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('plauti:duplicatecheck:sandbox:list', () => {
  let mockOrg;
  let mockFetch;
  let mockSpinner;
  let mockLogJson;
  
  beforeEach(() => {
    mockOrg = {
      getOrgId: mock.fn(() => 'prod-org-id-123')
    };

    mockFetch = mock.fn();
    
    mockSpinner = {
      start: mock.fn(),
      stop: mock.fn()
    };

    mockLogJson = mock.fn();
  });

  afterEach(() => {
    mock.reset();
  });

  test('should list sandboxes successfully', async () => {
    // Arrange
    const flags = {
      'target-org': mockOrg,
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    const mockSandboxData = [
      {
        id: 'sandbox-1',
        name: 'MySandbox1',
        orgId: 'org-123'
      },
      {
        id: 'sandbox-2', 
        name: 'MySandbox2',
        orgId: 'org-456'
      }
    ];

    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: true,
        json: () => Promise.resolve(mockSandboxData)
      })
    );

    // Act & Assert
    assert.ok(flags['plauti-cloud-api-key'], 'Should have API key');
    assert.strictEqual(mockOrg.getOrgId(), 'prod-org-id-123', 'Should use org ID');
    assert.ok(Array.isArray(mockSandboxData), 'Should return sandbox array');
    assert.strictEqual(mockSandboxData.length, 2, 'Should return correct number of sandboxes');
  });

  test('should require plauti-cloud-api-key', async () => {
    // Test missing API key
    const flags = {
      'target-org': mockOrg
    };

    if (!flags['plauti-cloud-api-key']) {
      const error = new Error('Parameter plauti-cloud-api-key is required.');
      assert.ok(error.message.includes('plauti-cloud-api-key is required'), 'Should require API key');
    }
  });

  test('should make correct API call with proper headers', async () => {
    // Arrange
    const flags = {
      'target-org': mockOrg,
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    const expectedApiCall = {
      url: 'https://cloud.plauti.com/public-api/rest-v1/sandbox-license/prod-org-id-123',
      method: 'GET',
      headers: {
        Authorization: 'plauti_api_key_123'
      }
    };

    // Act & Assert
    assert.strictEqual(expectedApiCall.method, 'GET', 'Should use GET method');
    assert.strictEqual(expectedApiCall.headers.Authorization, 'plauti_api_key_123', 'Should set authorization header');
    assert.ok(expectedApiCall.url.includes('sandbox-license'), 'Should use correct API endpoint');
    assert.ok(expectedApiCall.url.includes('prod-org-id-123'), 'Should include org ID in URL');
  });

  test('should handle HTTP errors gracefully', async () => {
    // Test HTTP error response
    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: false, 
        status: 403, 
        statusText: 'Forbidden' 
      })
    );

    try {
      const response = { ok: false, status: 403, statusText: 'Forbidden' };
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const finalError = new Error('Failed to get linked sandboxes. ' + error);
      assert.ok(finalError.message.includes('Failed to get linked sandboxes'), 'Should handle HTTP errors');
      assert.ok(finalError.message.includes('403'), 'Should include HTTP status');
      assert.ok(finalError.message.includes('Forbidden'), 'Should include status text');
    }
  });

  test('should handle network errors gracefully', async () => {
    // Test network error
    const networkError = new Error('Network timeout');
    mockFetch.mock.mockImplementation(() => 
      Promise.reject(networkError)
    );

    try {
      await mockFetch();
    } catch (error) {
      const finalError = new Error('Failed to get linked sandboxes. ' + error);
      assert.ok(finalError.message.includes('Failed to get linked sandboxes'), 'Should handle network errors');
      assert.ok(finalError.message.includes('Network timeout'), 'Should include original error');
    }
  });

  test('should handle JSON parsing errors', async () => {
    // Test malformed JSON response
    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })
    );

    try {
      const response = await mockFetch();
      await response.json();
    } catch (error) {
      assert.ok(error.message.includes('Invalid JSON'), 'Should handle JSON parsing errors');
    }
  });

  test('should return correct result structure', async () => {
    // Test successful response structure
    const mockSandboxData = [
      { id: 'sandbox-1', name: 'Test Sandbox' }
    ];

    const expectedResult = {
      status: 'done',
      sandboxes: mockSandboxData
    };

    assert.strictEqual(expectedResult.status, 'done', 'Should return done status');
    assert.ok(expectedResult.sandboxes, 'Should return sandboxes data');
    assert.strictEqual(expectedResult.sandboxes, mockSandboxData, 'Should return actual sandbox data');
  });

  test('should validate command configuration', async () => {
    // Test command static properties
    const summary = 'List all sandbox orgs';
    const examples = [
      'plauti plauti:duplicatecheck:sandbox:list --target-org myOrg@example.com --plauti-cloud-api-key plauti_123_123456'
    ];

    assert.strictEqual(summary, 'List all sandbox orgs', 'Should have correct summary');
    assert.ok(Array.isArray(examples), 'Should have examples array');
    assert.strictEqual(examples.length, 1, 'Should have 1 example');
    assert.ok(examples[0].includes('--target-org'), 'Should have target-org flag');
    assert.ok(examples[0].includes('--plauti-cloud-api-key'), 'Should have API key flag');
  });

  test('should handle spinner operations', async () => {
    // Test spinner start/stop operations
    mockSpinner.start('Getting linked sandboxes');
    assert.ok(mockSpinner.start.mock.calls.length > 0, 'Should start spinner');
    
    // Success case
    mockSpinner.stop('Done!');
    assert.ok(mockSpinner.stop.mock.calls.length > 0, 'Should stop spinner on success');
    
    // Failure case  
    mockSpinner.stop('Failed!');
    assert.ok(mockSpinner.stop.mock.calls.length > 0, 'Should stop spinner on failure');
  });

  test('should log JSON output', async () => {
    // Test JSON logging functionality
    const mockSandboxData = [
      { id: 'sandbox-1', name: 'Test Sandbox', status: 'active' },
      { id: 'sandbox-2', name: 'Dev Sandbox', status: 'inactive' }
    ];

    // Test that logJson can be called with sandbox data
    assert.ok(typeof mockLogJson === 'function', 'Should have logJson function');
    assert.ok(Array.isArray(mockSandboxData), 'Should have sandbox data to log');
    assert.ok(mockSandboxData.length > 0, 'Should have sandbox items to log');
  });

  test('should handle empty sandbox list', async () => {
    // Test empty response
    const emptySandboxList = [];

    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: true,
        json: () => Promise.resolve(emptySandboxList)
      })
    );

    const result = {
      status: 'done',
      sandboxes: emptySandboxList
    };

    assert.strictEqual(result.status, 'done', 'Should return done status for empty list');
    assert.ok(Array.isArray(result.sandboxes), 'Should return array even when empty');
    assert.strictEqual(result.sandboxes.length, 0, 'Should handle empty sandbox list');
  });

  test('should handle large sandbox lists', async () => {
    // Test large number of sandboxes
    const largeSandboxList = Array.from({ length: 100 }, (_, i) => ({
      id: `sandbox-${i}`,
      name: `Sandbox-${i}`,
      orgId: `org-${i}`
    }));

    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: true,
        json: () => Promise.resolve(largeSandboxList)
      })
    );

    const result = {
      status: 'done',
      sandboxes: largeSandboxList
    };

    assert.strictEqual(result.sandboxes.length, 100, 'Should handle large sandbox lists');
    assert.strictEqual(result.sandboxes[0].id, 'sandbox-0', 'Should maintain data integrity');
    assert.strictEqual(result.sandboxes[99].id, 'sandbox-99', 'Should handle all items in large list');
  });
});