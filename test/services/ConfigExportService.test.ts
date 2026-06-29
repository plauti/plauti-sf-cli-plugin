import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { ConfigExportService } from '../../src/services/ConfigExportService.js';
import { PollJobResponse } from '../../src/services/clients/SalesforceJobClient.js';

describe('ConfigExportService', () => {
  it('should have correct constructor parameters', () => {
    // Create mock dependencies
    const mockJobClient = {
      submitExportJob: () => Promise.resolve('job123'),
      pollJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse),
      downloadJobResult: () => Promise.resolve('{"rules": []}'),
      submitImportJob: () => Promise.resolve('job456'),
      pollImportJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse)
    };
    
    const mockFileSystem = {
      writeFile: () => Promise.resolve(),
      readFile: () => Promise.resolve('{"rules": []}'),
      validateFile: () => Promise.resolve({ size: 100, exists: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    // Test service instantiation
    const service = new ConfigExportService(mockJobClient, mockFileSystem);
    assert.ok(service);
    assert.ok(typeof service.exportConfig === 'function');
  });

  it('should successfully export config with mocked dependencies', async () => {
    let submitExportJobCalled = false;
    let pollJobStatusCalled = false;
    let downloadJobResultCalled = false;
    let writeFileCalled = false;

    const mockJobClient = {
      submitExportJob: () => {
        submitExportJobCalled = true;
        return Promise.resolve('job123');
      },
      pollJobStatus: (connection: any, jobId: string) => {
        assert.strictEqual(jobId, 'job123');
        pollJobStatusCalled = true;
        return Promise.resolve({
          ok: true,
          errorMessage: '',
          jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
        } as PollJobResponse);
      },
      downloadJobResult: (connection: any, jobId: string) => {
        assert.strictEqual(jobId, 'job123');
        downloadJobResultCalled = true;
        return Promise.resolve('{"rules": []}');
      },
      submitImportJob: () => Promise.resolve('job456'),
      pollImportJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse)
    };

    const mockFileSystem = {
      writeFile: (path: string, content: string) => {
        assert.strictEqual(path, 'config.json');
        assert.strictEqual(content, '{"rules": []}');
        writeFileCalled = true;
        return Promise.resolve();
      },
      readFile: () => Promise.resolve('{"rules": []}'),
      validateFile: () => Promise.resolve({ size: 100, exists: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigExportService(mockJobClient, mockFileSystem);
    
    const result = await service.exportConfig({
      connection: {} as any,
      filePath: 'config.json',
      pollInterval: 3
    });

    // Verify all mocked methods were called
    assert.ok(submitExportJobCalled, 'submitExportJob should be called');
    assert.ok(pollJobStatusCalled, 'pollJobStatus should be called');
    assert.ok(downloadJobResultCalled, 'downloadJobResult should be called');
    assert.ok(writeFileCalled, 'writeFile should be called');

    // Verify result structure
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.jobId, 'job123');
    assert.strictEqual(result.filePath, 'config.json');
  });

  it('should handle job failure error scenario', async () => {
    const mockJobClient = {
      submitExportJob: () => Promise.resolve('job123'),
      pollJobStatus: () => Promise.reject(new Error('Job failed due to error')),
      downloadJobResult: () => Promise.resolve('{"rules": []}'),
      submitImportJob: () => Promise.resolve('job456'),
      pollImportJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse)
    };

    const mockFileSystem = {
      writeFile: () => Promise.resolve(),
      readFile: () => Promise.resolve('{"rules": []}'),
      validateFile: () => Promise.resolve({ size: 100, exists: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigExportService(mockJobClient, mockFileSystem);
    
    try {
      await service.exportConfig({
        connection: {} as any,
        filePath: 'config.json',
        pollInterval: 1
      });
      assert.fail('Should have thrown an error for failed job');
    } catch (error) {
      assert.ok((error as Error).message.includes('Job failed'));
    }
  });

  it('should handle API submission error', async () => {
    const mockJobClient = {
      submitExportJob: () => Promise.reject(new Error('API Connection Failed')),
      pollJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse),
      downloadJobResult: () => Promise.resolve('{"rules": []}'),
      submitImportJob: () => Promise.resolve('job456'),
      pollImportJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse)
    };

    const mockFileSystem = {
      writeFile: () => Promise.resolve(),
      readFile: () => Promise.resolve('{"rules": []}'),
      validateFile: () => Promise.resolve({ size: 100, exists: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigExportService(mockJobClient, mockFileSystem);
    
    try {
      await service.exportConfig({
        connection: {} as any,
        filePath: 'config.json',
        pollInterval: 3
      });
      assert.fail('Should have thrown an error for API failure');
    } catch (error) {
      assert.ok((error as Error).message.includes('API Connection Failed'));
    }
  });

  it('should handle file system error', async () => {
    const mockJobClient = {
      submitExportJob: () => Promise.resolve('job123'),
      pollJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse),
      downloadJobResult: () => Promise.resolve('{"rules": []}'),
      submitImportJob: () => Promise.resolve('job456'),
      pollImportJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse)
    };

    const mockFileSystem = {
      writeFile: () => Promise.reject(new Error('Permission denied')),
      readFile: () => Promise.resolve('{"rules": []}'),
      validateFile: () => Promise.resolve({ size: 100, exists: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigExportService(mockJobClient, mockFileSystem);
    
    try {
      await service.exportConfig({
        connection: {} as any,
        filePath: 'config.json',
        pollInterval: 3
      });
      assert.fail('Should have thrown an error for file system failure');
    } catch (error) {
      assert.ok((error as Error).message.includes('Permission denied'));
    }
  });

  it('should validate business logic flow without external dependencies', async () => {
    // Test that the service correctly orchestrates the business logic
    const callOrder: string[] = [];

    const mockJobClient = {
      submitExportJob: () => {
        callOrder.push('submit');
        return Promise.resolve('job123');
      },
      pollJobStatus: () => {
        callOrder.push('poll');
        return Promise.resolve({
          ok: true,
          errorMessage: '',
          jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
        } as PollJobResponse);
      },
      downloadJobResult: () => {
        callOrder.push('download');
        return Promise.resolve('{"exportedData": "test"}');
      },
      submitImportJob: () => Promise.resolve('job456'),
      pollImportJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse)
    };

    const mockFileSystem = {
      writeFile: () => {
        callOrder.push('write');
        return Promise.resolve();
      },
      readFile: () => Promise.resolve('{"rules": []}'),
      validateFile: () => Promise.resolve({ size: 100, exists: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigExportService(mockJobClient, mockFileSystem);
    
    await service.exportConfig({
      connection: {} as any,
      filePath: 'test.json',
      pollInterval: 1
    });

    // Verify the correct business logic flow
    assert.deepStrictEqual(callOrder, ['submit', 'poll', 'download', 'write']);
  });
});
