export interface CsvRow {
  [key: string]: string;
}

export interface CsvReader {
  readCsvRows(filePath: string, delimiter: string): Promise<CsvRow[]>;
}

export class CsvReaderImpl implements CsvReader {
  async readCsvRows(filePath: string, delimiter: string): Promise<CsvRow[]> {
    const fs = await import('node:fs/promises');
    const csvContent = await fs.readFile(filePath, 'utf8');
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return [];
    }

    const firstLine = lines[0];
    if (!firstLine) {
      return [];
    }

    const headers = firstLine.split(delimiter).map(h => h.trim());
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        continue;
      }
      
      const values = line.split(delimiter).map(v => v.trim());
      const row: CsvRow = {};
      
      for (let j = 0; j < headers.length && j < values.length; j++) {
        const header = headers[j];
        const value = values[j];
        if (header !== undefined && value !== undefined) {
          row[header] = value;
        }
      }
      
      rows.push(row);
    }

    return rows;
  }
}
