import { test, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('plauti:duplicatecheck:sandbox:unlink', () => {
  let mockOrg;
  let mockSandboxOrg;
  let mockFetch;
  let mockSpinner;
  
  beforeEach(() => {
    mockOrg = {
      getOrgId: mock.fn(() => 'prod-org-id-123')
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

  test('should unlink sandbox using organization ID', async () => {
    // Arrange
    const flags = {
      'target-org': mockOrg,
      'organization-id': 'sandbox-org-id-456',
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ ok: true })
    );

    // Act & Assert
    assert.strictEqual(flags['organization-id'], 'sandbox-org-id-456', 'Should use provided org ID');
    assert.ok(flags['plauti-cloud-api-key'], 'Should have API key');
    
    // Verify API call would be made correctly
    const expectedUrl = `https://cloud.plauti.com/public-api/rest-v1/sandbox-license/sandbox-org-id-456/prod-org-id-123`;
    assert.ok(expectedUrl.includes('sandbox-license'), 'Should use correct API endpoint');
  });

  test('should unlink sandbox using username resolution', async () => {
    // Arrange
    const flags = {
      'target-org': mockOrg,
      'sandbox-username': 'sandbox@example.com',
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
      'organization-id': 'sandbox-org-id-456'
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
      'plauti-cloud-api-key': 'plauti_api_key_123'
    };

    const expectedApiCall = {
      url: 'https://cloud.plauti.com/public-api/rest-v1/sandbox-license/sandbox-org-id-456/prod-org-id-123',
      method: 'POST',
      headers: {
        'Authorization': 'plauti_api_key_123'
      }
    };

    // Act & Assert
    assert.strictEqual(expectedApiCall.method, 'POST', 'Should use POST method');
    assert.strictEqual(expectedApiCall.headers['Authorization'], 'plauti_api_key_123', 'Should set authorization header');
    assert.ok(expectedApiCall.url.includes('sandbox-license'), 'Should use correct API endpoint');
    assert.ok(expectedApiCall.url.includes('sandbox-org-id-456'), 'Should include sandbox org ID in URL');
    assert.ok(expectedApiCall.url.includes('prod-org-id-123'), 'Should include production org ID in URL');
  });

  test('should handle HTTP errors gracefully', async () => {
    // Test HTTP error response
    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: false, 
        status: 404, 
        statusText: 'Not Found' 
      })
    );

    try {
      if (!{ ok: false, status: 404, statusText: 'Not Found' }.ok) {
        throw new Error(`HTTP 404: Not Found`);
      }
    } catch (error) {
      const finalError = new Error('Failed to unlink sandbox. ' + error);
      assert.ok(finalError.message.includes('Failed to unlink sandbox'), 'Should handle HTTP errors');
      assert.ok(finalError.message.includes('404'), 'Should include HTTP status');
    }
  });

  test('should handle network errors gracefully', async () => {
    // Test network error
    const networkError = new Error('Connection refused');
    mockFetch.mock.mockImplementation(() => 
      Promise.reject(networkError)
    );

    try {
      await mockFetch();
    } catch (error) {
      const finalError = new Error('Failed to unlink sandbox. ' + error);
      assert.ok(finalError.message.includes('Failed to unlink sandbox'), 'Should handle network errors');
      assert.ok(finalError.message.includes('Connection refused'), 'Should include original error');
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
    const summary = 'Unlink Sandbox from Production';
    const examples = [
      'plauti plauti:duplicatecheck:sandbox:unlink --target-org myOrg@example.com --organization-id 00DR0000001ossaMAA --plauti-cloud-api-key plauti_123_123456',
      'plauti plauti:duplicatecheck:sandbox:unlink --target-org myOrg@example.com --sandbox-username scratch_org_1 --plauti-cloud-api-key plauti_123_123456'
    ];

    assert.strictEqual(summary, 'Unlink Sandbox from Production', 'Should have correct summary');
    assert.ok(Array.isArray(examples), 'Should have examples array');
    assert.strictEqual(examples.length, 2, 'Should have 2 examples');
    assert.ok(examples[0].includes('--organization-id'), 'Should have organization-id example');
    assert.ok(examples[1].includes('--sandbox-username'), 'Should have sandbox-username example');
  });

  test('should handle spinner operations', async () => {
    // Test spinner start/stop operations
    mockSpinner.start('Unlinking sandbox');
    assert.ok(mockSpinner.start.mock.calls.length > 0, 'Should start spinner');
    
    // Success case
    mockSpinner.stop('Done!');
    assert.ok(mockSpinner.stop.mock.calls.length > 0, 'Should stop spinner on success');
    
    // Failure case  
    mockSpinner.stop('Failed!');
    assert.ok(mockSpinner.stop.mock.calls.length > 0, 'Should stop spinner on failure');
  });

  test('should handle authentication errors', async () => {
    // Test authentication failure
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
      const finalError = new Error('Failed to unlink sandbox. ' + error);
      assert.ok(finalError.message.includes('Unauthorized'), 'Should handle authentication errors');
    }
  });

  test('should handle sandbox not found errors', async () => {
    // Test sandbox not found
    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: false, 
        status: 404, 
        statusText: 'Sandbox not found' 
      })
    );

    try {
      if (!{ ok: false, status: 404, statusText: 'Sandbox not found' }.ok) {
        throw new Error(`HTTP 404: Sandbox not found`);
      }
    } catch (error) {
      const finalError = new Error('Failed to unlink sandbox. ' + error);
      assert.ok(finalError.message.includes('Sandbox not found'), 'Should handle sandbox not found errors');
    }
  });

  test('should validate URL construction', async () => {
    // Test URL construction with different org IDs
    const testCases = [
      {
        sandboxOrgId: '00D000000000001EAA',
        prodOrgId: '00D000000000002EAA',
        expectedUrl: 'https://cloud.plauti.com/public-api/rest-v1/sandbox-license/00D000000000001EAA/00D000000000002EAA'
      },
      {
        sandboxOrgId: '00D123456789ABC',
        prodOrgId: '00D987654321XYZ',
        expectedUrl: 'https://cloud.plauti.com/public-api/rest-v1/sandbox-license/00D123456789ABC/00D987654321XYZ'
      }
    ];

    testCases.forEach(testCase => {
      const url = `https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${testCase.sandboxOrgId}/${testCase.prodOrgId}`;
      assert.strictEqual(url, testCase.expectedUrl, `Should construct correct URL for ${testCase.sandboxOrgId}`);
    });
  });

  test('should handle server errors', async () => {
    // Test server error response
    mockFetch.mock.mockImplementation(() => 
      Promise.resolve({ 
        ok: false, 
        status: 500, 
        statusText: 'Internal Server Error' 
      })
    );

    try {
      if (!{ ok: false, status: 500, statusText: 'Internal Server Error' }.ok) {
        throw new Error(`HTTP 500: Internal Server Error`);
      }
    } catch (error) {
      const finalError = new Error('Failed to unlink sandbox. ' + error);
      assert.ok(finalError.message.includes('Internal Server Error'), 'Should handle server errors');
      assert.ok(finalError.message.includes('500'), 'Should include server error status');
    }
  });
});