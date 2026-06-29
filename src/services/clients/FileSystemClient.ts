import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface FileStats {
  exists: boolean;
  size?: number;
  isFile?: boolean;
}

export interface FileSystemClient {
  writeFile(filePath: string, content: string): Promise<void>;
  readFile(filePath: string): Promise<string>;
  validateFile(filePath: string): Promise<FileStats>;
  ensureDirectoryExists(filePath: string): Promise<void>;
}

export class FileSystemClientImpl implements FileSystemClient {
  async writeFile(filePath: string, content: string): Promise<void> {
    await this.ensureDirectoryExists(filePath);
    await fs.writeFile(filePath, content, 'utf8');
  }

  async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf8');
  }

  async validateFile(filePath: string): Promise<FileStats> {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        isFile: stats.isFile()
      };
    } catch {
      return { exists: false };
    }
  }

  async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }
}