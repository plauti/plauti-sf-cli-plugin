import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { DuplicateJobService } from '../../src/services/DuplicateJobService.js';

describe('DuplicateJobService', () => {
  it('should have correct constructor parameters', () => {
    const mockCsvReader = {
      readCsvRows: () => Promise.resolve([])
    };
    
    const mockSalesforceClient = {
      createJob: () => Promise.resolve('job123'),
      createDuplicateGroups: () => Promise.resolve(),
      createDuplicatePairs: () => Promise.resolve({ successCount: 2, errorCount: 0 })
    };

    const service = new DuplicateJobService(mockCsvReader, mockSalesforceClient);
    assert.ok(service);
    assert.ok(typeof service.createJobFromCsv === 'function');
  });

  it('should successfully create job from CSV with mocked dependencies', async () => {
    let readCsvRowsCalled = false;
    let createJobCalled = false;
    let createDuplicateGroupsCalled = false;
    let createDuplicatePairsCalled = false;

    const mockCsvData = [
      { sourceId: 'Account0031234567890AB', duplicateId: 'Account0031234567890AC' },
      { sourceId: 'Account0031234567890AD', duplicateId: 'Account0031234567890AE' }
    ];

    const mockCsvReader = {
      readCsvRows: (filePath: string, delimiter: string) => {
        assert.strictEqual(filePath, 'test.csv');
        assert.strictEqual(delimiter, ',');
        readCsvRowsCalled = true;
        return Promise.resolve(mockCsvData);
      }
    };
    
    const mockSalesforceClient = {
      createJob: (connection: any, jobData: any) => {
        assert.ok(connection);
        assert.ok(jobData);
        createJobCalled = true;
        return Promise.resolve('job123');
      },
      createDuplicateGroups: (connection: any, jobId: string, groups: any[], setMasterForMerge: boolean) => {
        assert.strictEqual(jobId, 'job123');
        assert.ok(Array.isArray(groups));
        createDuplicateGroupsCalled = true;
        return Promise.resolve();
      },
      createDuplicatePairs: (connection: any, jobId: string, groups: any[]) => {
        assert.strictEqual(jobId, 'job123');
        assert.ok(Array.isArray(groups));
        createDuplicatePairsCalled = true;
        return Promise.resolve({ successCount: 2, errorCount: 0 });
      }
    };

    const service = new DuplicateJobService(mockCsvReader, mockSalesforceClient);
    
    const result = await service.createJobFromCsv({
      connection: {} as any,
      filePath: 'test.csv',
      delimiter: ',',
      sourceObject: 'Account',
      matchObject: 'Account',
      setMasterForMerge: false
    });

    // Verify all mocked methods were called
    assert.ok(readCsvRowsCalled, 'readCsvRows should be called');
    assert.ok(createJobCalled, 'createJob should be called');
    assert.ok(createDuplicateGroupsCalled, 'createDuplicateGroups should be called');
    assert.ok(createDuplicatePairsCalled, 'createDuplicatePairs should be called');

    // Verify result structure
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.jobId, 'job123');
    assert.ok(result.groupsProcessed);
    assert.ok(result.pairsProcessed);
  });

  it('should handle CSV reading error', async () => {
    const mockCsvReader = {
      readCsvRows: () => Promise.reject(new Error('File not found'))
    };
    
    const mockSalesforceClient = {
      createJob: () => Promise.resolve('job123'),
      createDuplicateGroups: () => Promise.resolve(),
      createDuplicatePairs: () => Promise.resolve({ successCount: 0, errorCount: 0 })
    };

    const service = new DuplicateJobService(mockCsvReader, mockSalesforceClient);
    
    try {
      await service.createJobFromCsv({
        connection: {} as any,
        filePath: 'missing.csv',
        delimiter: ',',
        sourceObject: 'Account',
        matchObject: 'Account',
        setMasterForMerge: false
      });
      assert.fail('Should have thrown an error for missing CSV file');
    } catch (error) {
      assert.ok((error as Error).message.includes('File not found'));
    }
  });

  it('should handle empty CSV data', async () => {
    const mockCsvReader = {
      readCsvRows: () => Promise.resolve([])
    };
    
    const mockSalesforceClient = {
      createJob: () => Promise.resolve('job123'),
      createDuplicateGroups: () => Promise.resolve(),
      createDuplicatePairs: () => Promise.resolve({ successCount: 0, errorCount: 0 })
    };

    const service = new DuplicateJobService(mockCsvReader, mockSalesforceClient);
    
    const result = await service.createJobFromCsv({
      connection: {} as any,
      filePath: 'empty.csv',
      delimiter: ',',
      sourceObject: 'Account',
      matchObject: 'Account',
      setMasterForMerge: false
    });

    // Empty CSV should return completed status with no groups
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.jobId, undefined);
  });

  it('should handle Salesforce job creation error', async () => {
    const mockCsvReader = {
      readCsvRows: () => Promise.resolve([
        { master: 'Account1', match: 'Account2' }
      ])
    };
    
    const mockSalesforceClient = {
      createJob: () => Promise.reject(new Error('Salesforce API Error')),
      createDuplicateGroups: () => Promise.resolve(),
      createDuplicatePairs: () => Promise.resolve({ successCount: 0, errorCount: 0 })
    };

    const service = new DuplicateJobService(mockCsvReader, mockSalesforceClient);
    
    try {
      await service.createJobFromCsv({
        connection: {} as any,
        filePath: 'test.csv',
        delimiter: ',',
        sourceObject: 'Account',
        matchObject: 'Account',
        setMasterForMerge: false
      });
      assert.fail('Should have thrown an error for Salesforce API failure');
    } catch (error) {
      assert.ok((error as Error).message.includes('Salesforce API Error'));
    }
  });

  it('should validate business logic flow', async () => {
    const callOrder: string[] = [];

    const mockCsvReader = {
      readCsvRows: () => {
        callOrder.push('readCsv');
        return Promise.resolve([
          { master: 'Account123001', match: 'Account456001' }
        ]);
      }
    };
    
    const mockSalesforceClient = {
      createJob: () => {
        callOrder.push('createJob');
        return Promise.resolve('job123');
      },
      createDuplicateGroups: () => {
        callOrder.push('createGroups');
        return Promise.resolve();
      },
      createDuplicatePairs: () => {
        callOrder.push('createPairs');
        return Promise.resolve({ successCount: 1, errorCount: 0 });
      }
    };

    const service = new DuplicateJobService(mockCsvReader, mockSalesforceClient);
    
    await service.createJobFromCsv({
      connection: {} as any,
      filePath: 'test.csv',
      delimiter: ',',
      sourceObject: 'Account',
      matchObject: 'Account',
      setMasterForMerge: false
    });

    // Verify the correct business logic flow
    assert.deepStrictEqual(callOrder, ['readCsv', 'createJob', 'createGroups', 'createPairs']);
  });

  it('should handle duplicate group detection correctly', async () => {
    const mockCsvData = [
      { sourceId: 'Account0031234567890AB', duplicateId: 'Account0031234567890AC' },
      { sourceId: 'Account0031234567890AD', duplicateId: 'Account0031234567890AE' }
    ];

    let detectedGroups: any[] = [];

    const mockCsvReader = {
      readCsvRows: () => Promise.resolve(mockCsvData)
    };
    
    const mockSalesforceClient = {
      createJob: () => Promise.resolve('job123'),
      createDuplicateGroups: (connection: any, jobId: string, groups: any[]) => {
        detectedGroups = groups;
        return Promise.resolve();
      },
      createDuplicatePairs: () => Promise.resolve({ successCount: 2, errorCount: 0 })
    };

    const service = new DuplicateJobService(mockCsvReader, mockSalesforceClient);
    
    const result = await service.createJobFromCsv({
      connection: {} as any,
      filePath: 'test.csv',
      delimiter: ',',
      sourceObject: 'Account',
      matchObject: 'Account',
      setMasterForMerge: false
    });

    // Verify that duplicate groups were detected and processed
    assert.ok(detectedGroups.length > 0, 'Should have detected duplicate groups');
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.groupsProcessed, 2);
  });
});