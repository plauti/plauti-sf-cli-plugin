import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { ConfigImportService } from '../../src/services/ConfigImportService.js';
import { PollJobResponse } from '../../src/services/clients/SalesforceJobClient.js';

describe('ConfigImportService', () => {
  it('should have correct constructor parameters', () => {
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

    const service = new ConfigImportService(mockJobClient, mockFileSystem);
    assert.ok(service);
    assert.ok(typeof service.importConfig === 'function');
  });

  it('should successfully import config with mocked dependencies', async () => {
    let validateFileCalled = false;
    let readFileCalled = false;
    let submitImportJobCalled = false;
    let pollImportJobStatusCalled = false;

    const mockJobClient = {
      submitExportJob: () => Promise.resolve('job123'),
      pollJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse),
      downloadJobResult: () => Promise.resolve('{"rules": []}'),
      submitImportJob: (connection: any, config: Record<string, unknown>) => {
        submitImportJobCalled = true;
        assert.ok(config);
        return Promise.resolve('job456');
      },
      pollImportJobStatus: (connection: any, jobId: string) => {
        assert.strictEqual(jobId, 'job456');
        pollImportJobStatusCalled = true;
        return Promise.resolve({
          ok: true,
          errorMessage: '',
          jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
        } as PollJobResponse);
      }
    };

    const mockFileSystem = {
      writeFile: () => Promise.resolve(),
      readFile: (path: string) => {
        assert.strictEqual(path, 'import-config.json');
        readFileCalled = true;
        return Promise.resolve('{"rules": [{"id": "test"}]}');
      },
      validateFile: (path: string) => {
        assert.strictEqual(path, 'import-config.json');
        validateFileCalled = true;
        return Promise.resolve({ size: 100, exists: true, isFile: true });
      },
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigImportService(mockJobClient, mockFileSystem);
    
    const result = await service.importConfig({
      connection: {} as any,
      filePath: 'import-config.json',
      pollInterval: 3
    });

    // Verify all mocked methods were called
    assert.ok(validateFileCalled, 'validateFile should be called');
    assert.ok(readFileCalled, 'readFile should be called');
    assert.ok(submitImportJobCalled, 'submitImportJob should be called');
    assert.ok(pollImportJobStatusCalled, 'pollImportJobStatus should be called');

    // Verify result structure
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.jobId, 'job456');
  });

  it('should handle invalid JSON in config file', async () => {
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
      readFile: () => Promise.resolve('invalid json content'),
      validateFile: () => Promise.resolve({ size: 100, exists: true, isFile: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigImportService(mockJobClient, mockFileSystem);
    
    try {
      await service.importConfig({
        connection: {} as any,
        filePath: 'invalid-config.json',
        pollInterval: 3
      });
      assert.fail('Should have thrown an error for invalid JSON');
    } catch (error) {
      assert.ok((error as Error).message.includes('Invalid JSON'));
    }
  });

  it('should handle file not found error', async () => {
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
      readFile: () => Promise.reject(new Error('File not found')),
      validateFile: () => Promise.resolve({ size: 0, exists: false, isFile: false }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigImportService(mockJobClient, mockFileSystem);
    
    try {
      await service.importConfig({
        connection: {} as any,
        filePath: 'missing-config.json',
        pollInterval: 3
      });
      assert.fail('Should have thrown an error for missing file');
    } catch (error) {
      assert.ok((error as Error).message.includes('File not found') || (error as Error).message.includes('ENOENT') || (error as Error).message.includes('not found'));
    }
  });

  it('should handle import job failure', async () => {
    const mockJobClient = {
      submitExportJob: () => Promise.resolve('job123'),
      pollJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse),
      downloadJobResult: () => Promise.resolve('{"rules": []}'),
      submitImportJob: () => Promise.resolve('job456'),
      pollImportJobStatus: () => Promise.reject(new Error('Import validation failed'))
    };

    const mockFileSystem = {
      writeFile: () => Promise.resolve(),
      readFile: () => Promise.resolve('{"rules": [{"id": "test"}]}'),
      validateFile: () => Promise.resolve({ size: 100, exists: true, isFile: true }),
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigImportService(mockJobClient, mockFileSystem);
    
    try {
      await service.importConfig({
        connection: {} as any,
        filePath: 'config.json',
        pollInterval: 1
      });
      assert.fail('Should have thrown an error for failed import job');
    } catch (error) {
      assert.ok((error as Error).message.includes('Import validation failed'));
    }
  });

  it('should validate business logic flow', async () => {
    const callOrder: string[] = [];

    const mockJobClient = {
      submitExportJob: () => Promise.resolve('job123'),
      pollJobStatus: () => Promise.resolve({
        ok: true,
        errorMessage: '',
        jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
      } as PollJobResponse),
      downloadJobResult: () => Promise.resolve('{"rules": []}'),
      submitImportJob: () => {
        callOrder.push('submitImport');
        return Promise.resolve('job456');
      },
      pollImportJobStatus: () => {
        callOrder.push('pollImport');
        return Promise.resolve({
          ok: true,
          errorMessage: '',
          jobInfo: { Status: 'Completed', ExtendedStatus: 'Job completed successfully' }
        } as PollJobResponse);
      }
    };

    const mockFileSystem = {
      writeFile: () => Promise.resolve(),
      readFile: () => {
        callOrder.push('readFile');
        return Promise.resolve('{"rules": []}');
      },
      validateFile: () => {
        callOrder.push('validateFile');
        return Promise.resolve({ size: 100, exists: true, isFile: true });
      },
      ensureDirectoryExists: () => Promise.resolve()
    };

    const service = new ConfigImportService(mockJobClient, mockFileSystem);
    
    await service.importConfig({
      connection: {} as any,
      filePath: 'test.json',
      pollInterval: 1
    });

    // Verify the correct business logic flow
    assert.deepStrictEqual(callOrder, ['validateFile', 'readFile', 'submitImport', 'pollImport']);
  });
});