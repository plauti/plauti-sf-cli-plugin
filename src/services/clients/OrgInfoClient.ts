import { Org } from '@salesforce/core';

export interface OrgInfoClient {
  getOrgId(org: Org): Promise<string>;
  getUsername(org: Org): Promise<string>;
  getOrgIdFromUsername(username: string): Promise<string>;
}

export class OrgInfoClientImpl implements OrgInfoClient {
  async getOrgId(org: Org): Promise<string> {
    return (org as any).getOrgId();
  }

  async getUsername(org: Org): Promise<string> {
    return (org as any).getUsername();
  }

  async getOrgIdFromUsername(username: string): Promise<string> {
    const sandboxOrg = await Org.create({ aliasOrUsername: username });
    return sandboxOrg.getOrgId();
  }
}