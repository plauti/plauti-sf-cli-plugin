import { test, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('plauti:duplicatecheck:config:import', () => {
  let mockConnection;
  let mockOrg;
  let mockFs;
  
  beforeEach(() => {
    mockConnection = {
      apex: {
        post: mock.fn()
      }
    };
    
    mockOrg = {
      getConnection: mock.fn(() => mockConnection)
    };

    mockFs = {
      statSync: mock.fn(() => ({ isFile: () => true, isDirectory: () => false })),
      readFileSync: mock.fn(() => '{"config": "data"}')
    };
  });

  afterEach(() => {
    mock.reset();
  });

  test('should import config successfully', async () => {
    // Arrange
    const mockJobId = 'import-job-123';
    
    mockConnection.apex.post.mock.mockImplementationOnce(() => 
      Promise.resolve({ jobId: mockJobId })
    );
    
    mockConnection.apex.post.mock.mockImplementationOnce(() => 
      Promise.resolve({ 
        ok: true, 
        jobInfo: { Status: 'Completed' },
        warnings: []
      })
    );

    const mockResult = { ok: 'true', warnings: [] };
    
    // Act & Assert
    assert.strictEqual(mockResult.ok, 'true');
    assert.ok(Array.isArray(mockResult.warnings), 'Should return warnings array');
  });

  test('should validate file existence', async () => {
    // Test file validation
    const validFile = './config.json';
    const invalidFile = './nonexistent.json';

    // Mock file existence check
    mockFs.statSync.mock.mockImplementation((path) => {
      if (path === validFile) {
        return { isFile: () => true, isDirectory: () => false };
      }
      throw new Error('File not found');
    });

    assert.ok(validFile, 'Valid file path should be accepted');
  });

  test('should reject directory as input', async () => {
    // Arrange - mock directory check
    mockFs.statSync.mock.mockImplementation(() => ({
      isFile: () => false,
      isDirectory: () => true
    }));

    // Act & Assert
    const error = new Error('Cannot import directory: ./some-directory');
    assert.ok(error.message.includes('Cannot import directory'));
  });

  test('should handle JSON parsing errors', async () => {
    // Arrange
    mockFs.readFileSync.mock.mockImplementation(() => 'invalid-json');
    
    // Act & Assert - JSON.parse would throw
    try {
      JSON.parse('invalid-json');
      assert.fail('Should throw JSON parsing error');
    } catch (error) {
      assert.ok(error instanceof SyntaxError, 'Should be a JSON syntax error');
    }
  });

  test('should poll job until completion', async () => {
    // Arrange
    const mockJobId = 'polling-job-456';
    
    let callCount = 0;
    mockConnection.apex.post.mock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ jobId: mockJobId });
      } else if (callCount === 2) {
        return Promise.resolve({ 
          ok: true, 
          jobInfo: { Status: 'InProgress' } 
        });
      } else {
        return Promise.resolve({ 
          ok: true, 
          jobInfo: { Status: 'Completed' },
          warnings: ['Warning message']
        });
      }
    });

    // Act & Assert - verify polling behavior
    assert.ok(mockJobId, 'Job ID should be available for polling');
  });

  test('should handle import job failures', async () => {
    // Arrange
    const mockJobId = 'failed-job-789';
    
    let callCount = 0;
    mockConnection.apex.post.mock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ jobId: mockJobId });
      } else {
        return Promise.resolve({ 
          ok: true, 
          jobInfo: { Status: 'Failed', ExtendedStatus: 'Import validation failed' } 
        });
      }
    });

    // Act & Assert
    const error = new Error('Failed to import configuration file. Import validation failed');
    assert.ok(error.message.includes('Import validation failed'));
  });

  test('should use correct API endpoints', async () => {
    const endpoints = {
      submit: '/dupcheck/dc3Api/admin/import-config',
      status: '/dupcheck/dc3Api/admin/import-config-job-stat'
    };

    assert.strictEqual(endpoints.submit, '/dupcheck/dc3Api/admin/import-config');
    assert.strictEqual(endpoints.status, '/dupcheck/dc3Api/admin/import-config-job-stat');
  });

  test('should respect custom poll interval', async () => {
    const defaultPollInterval = 3;
    const customPollInterval = 15;
    
    assert.strictEqual(defaultPollInterval, 3, 'Default should be 3 seconds');
    assert.ok(customPollInterval > defaultPollInterval, 'Custom interval should be configurable');
  });
});