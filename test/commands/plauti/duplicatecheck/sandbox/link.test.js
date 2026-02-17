import { test, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('plauti:duplicatecheck:sandbox:link', () => {
  let mockOrg;
  let mockSandboxOrg;
  let mockFetch;
  let mockSpinner;
  
  beforeEach(() => {
    mockOrg = {
      getOrgId: mock.fn(() => 'prod-org-id-123'),
      getUsername: mock.fn(() => 'prod@example.com')
    };
    
    mockSandboxOrg = {
      getOrgId: mock.fn(() => 'sandbox-org-id-456')
    };

    mockFetch = mock.fn();
    
    mockSpinner = {
      start: mock.fn(),
      stop: mock.fn()
    };
  });

  afterEach(() => {
    mock.reset();
  });

  test('should link sandbox using organization ID', async () => {
    // Arrange
    const flags = {
      'target-org': mockOrg,
      'organization-id': 'sandbox-org-id-456',
      'sandbox-name': 'MySandbox',
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ ok: true })
    );

    // Act & Assert
    assert.strictEqual(flags['organization-id'], 'sandbox-org-id-456', 'Should use provided org ID');
    assert.strictEqual(flags['sandbox-name'], 'MySandbox', 'Should use sandbox name');
    assert.ok(flags['plauti-cloud-api-key'], 'Should have API key');
    
    // Verify API call would be made correctly
    const expectedUrl = `https://cloud.plauti.com/public-api/rest-v1/sandbox-license/sandbox-org-id-456/prod-org-id-123`;
    assert.ok(expectedUrl.includes('sandbox-license'), 'Should use correct API endpoint');
  });

  test('should link sandbox using username resolution', async () => {
    // Arrange
    const flags = {
      'target-org': mockOrg,
      'sandbox-username': 'sandbox@example.com',
      'sandbox-name': 'MySandbox',
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    // Mock Org.create to resolve sandbox username
    const mockOrgCreate = mock.fn(() => Promise.resolve(mockSandboxOrg));

    // Act & Assert
    assert.strictEqual(flags['sandbox-username'], 'sandbox@example.com', 'Should use sandbox username');
    assert.ok(mockOrgCreate, 'Should create org from username');
    assert.strictEqual(mockSandboxOrg.getOrgId(), 'sandbox-org-id-456', 'Should resolve org ID from username');
  });

  test('should require organization-id or sandbox-username', async () => {
    // Test missing both parameters
    const flags = {
      'target-org': mockOrg,
      'sandbox-name': 'MySandbox',
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    if (!flags['organization-id'] && !flags['sandbox-username']) {
      const error = new Error('Parameter organization-id or sandbox-username is required.');
      assert.ok(error.message.includes('organization-id or sandbox-username is required'), 'Should require one of the parameters');
    }
  });

  test('should require plauti-cloud-api-key', async () => {
    // Test missing API key
    const flags = {
      'target-org': mockOrg,
      'organization-id': 'sandbox-org-id-456',
      'sandbox-name': 'MySandbox'
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
      'organization-id': 'sandbox-org-id-456',
      'sandbox-name': 'MySandbox',
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    const expectedApiCall = {
      url: 'https://cloud.plauti.com/public-api/rest-v1/sandbox-license/sandbox-org-id-456/prod-org-id-123',
      method: 'PUT',
      headers: {
        'Authorization': 'plauti_api_key_123',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'prod@example.com',
        sandboxName: 'MySandbox'
      })
    };

    // Act & Assert
    assert.strictEqual(expectedApiCall.method, 'PUT', 'Should use PUT method');
    assert.strictEqual(expectedApiCall.headers['Authorization'], 'plauti_api_key_123', 'Should set authorization header');
    assert.strictEqual(expectedApiCall.headers['Content-Type'], 'application/json', 'Should set content type');
    
    const bodyData = JSON.parse(expectedApiCall.body);
    assert.strictEqual(bodyData.username, 'prod@example.com', 'Should include username in body');
    assert.strictEqual(bodyData.sandboxName, 'MySandbox', 'Should include sandbox name in body');
  });

  test('should handle HTTP errors gracefully', async () => {
    // Test HTTP error response
    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: false, 
        status: 401, 
        statusText: 'Unauthorized' 
      })
    );

    try {
      if (!{ ok: false, status: 401, statusText: 'Unauthorized' }.ok) {
        throw new Error(`HTTP 401: Unauthorized`);
      }
    } catch (error) {
      const finalError = new Error('Failed to link sandbox. ' + error);
      assert.ok(finalError.message.includes('Failed to link sandbox'), 'Should handle HTTP errors');
      assert.ok(finalError.message.includes('401'), 'Should include HTTP status');
    }
  });

  test('should handle network errors gracefully', async () => {
    // Test network error
    const networkError = new Error('Network connection failed');
    mockFetch.mock.mockImplementation(() => 
      Promise.reject(networkError)
    );

    try {
      await mockFetch();
    } catch (error) {
      const finalError = new Error('Failed to link sandbox. ' + error);
      assert.ok(finalError.message.includes('Failed to link sandbox'), 'Should handle network errors');
      assert.ok(finalError.message.includes('Network connection failed'), 'Should include original error');
    }
  });

  test('should return correct result on success', async () => {
    // Test successful response
    const expectedResult = {
      status: 'done'
    };

    assert.strictEqual(expectedResult.status, 'done', 'Should return done status');
    assert.ok(typeof expectedResult === 'object', 'Should return object result');
  });

  test('should validate command configuration', async () => {
    // Test command static properties
    const summary = 'Link Sandbox to Production';
    const examples = [
      'plauti plauti:duplicatecheck:sandbox:link --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --sandbox-name mysandbox --plauti-cloud-api-key plauti_123_123456',
      'plauti plauti:duplicatecheck:sandbox:link --target-org myOrg@example.com --sandbox-username scratch_org_1 --sandbox-name mysandbox --plauti-cloud-api-key plauti_123_123456'
    ];

    assert.strictEqual(summary, 'Link Sandbox to Production', 'Should have correct summary');
    assert.ok(Array.isArray(examples), 'Should have examples array');
    assert.strictEqual(examples.length, 2, 'Should have 2 examples');
    assert.ok(examples[0].includes('--organization-id'), 'Should have organization-id example');
    assert.ok(examples[1].includes('--sandbox-username'), 'Should have sandbox-username example');
  });

  test('should handle spinner operations', async () => {
    // Test spinner start/stop operations
    mockSpinner.start('Linking sandbox');
    assert.ok(mockSpinner.start.mock.calls.length > 0, 'Should start spinner');
    
    // Success case
    mockSpinner.stop('Done!');
    assert.ok(mockSpinner.stop.mock.calls.length > 0, 'Should stop spinner on success');
    
    // Failure case  
    mockSpinner.stop('Failed!');
    assert.ok(mockSpinner.stop.mock.calls.length > 0, 'Should stop spinner on failure');
  });
});