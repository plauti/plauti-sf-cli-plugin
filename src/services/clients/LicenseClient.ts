import { Connection } from '@salesforce/core';

export interface LicenseResult {
  status: string;
}

export interface LicenseClient {
  refreshLicense(connection: Connection): Promise<LicenseResult>;
}

export class LicenseClientImpl implements LicenseClient {
  async refreshLicense(connection: Connection): Promise<LicenseResult> {
    await connection.apex.post('/dupcheck/dc3Api/admin/refresh-license', {});
    return { status: 'done' };
  }
}