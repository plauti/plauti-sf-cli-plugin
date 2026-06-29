import { Connection } from '@salesforce/core';
import { LicenseClient } from './clients/LicenseClient.js';

export interface LicenseRefreshParams {
  connection: Connection;
}

export interface LicenseRefreshResult {
  status: string;
}

export class LicenseService {
  constructor(private licenseClient: LicenseClient) {}

  async refreshLicense(params: LicenseRefreshParams): Promise<LicenseRefreshResult> {
    const { connection } = params;
    
    const result = await this.licenseClient.refreshLicense(connection);
    
    return {
      status: result.status
    };
  }
}