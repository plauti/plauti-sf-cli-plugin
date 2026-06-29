import { Org } from '@salesforce/core';
import { PlautiCloudClient, SandboxInfo } from './clients/PlautiCloudClient.js';
import { OrgInfoClient } from './clients/OrgInfoClient.js';

export interface LinkSandboxParams {
  org: Org;
  organizationId?: string;
  sandboxUsername?: string;
  sandboxName: string;
  plautiCloudApiKey: string;
}

export interface LinkSandboxResult {
  status: string;
}

export interface ListSandboxesParams {
  org: Org;
  plautiCloudApiKey: string;
}

export interface ListSandboxesResult {
  status: string;
  sandboxes: SandboxInfo[];
}

export interface UnlinkSandboxParams {
  org: Org;
  organizationId: string;
  plautiCloudApiKey: string;
}

export interface UnlinkSandboxResult {
  status: string;
}

export class SandboxManagementService {
  constructor(
    private plautiCloudClient: PlautiCloudClient,
    private orgInfoClient: OrgInfoClient
  ) {}

  async linkSandbox(params: LinkSandboxParams): Promise<LinkSandboxResult> {
    const { org, organizationId, sandboxUsername, sandboxName, plautiCloudApiKey } = params;

    if (!organizationId && !sandboxUsername) {
      throw new Error('Parameter organization-id or sandbox-username is required.');
    }

    let sandboxOrgId = organizationId;
    if (!sandboxOrgId && sandboxUsername) {
      sandboxOrgId = await this.orgInfoClient.getOrgIdFromUsername(sandboxUsername);
    }

    const prodOrgId = await this.orgInfoClient.getOrgId(org);
    const username = await this.orgInfoClient.getUsername(org);

    const result = await this.plautiCloudClient.linkSandbox({
      sandboxOrgId: sandboxOrgId!,
      prodOrgId,
      username,
      sandboxName,
      apiKey: plautiCloudApiKey
    });

    return {
      status: result.status
    };
  }

  async listSandboxes(params: ListSandboxesParams): Promise<ListSandboxesResult> {
    const { org, plautiCloudApiKey } = params;

    const orgId = await this.orgInfoClient.getOrgId(org);
    const sandboxes = await this.plautiCloudClient.listSandboxes(orgId, plautiCloudApiKey);

    return {
      status: 'done',
      sandboxes
    };
  }

  async unlinkSandbox(params: UnlinkSandboxParams): Promise<UnlinkSandboxResult> {
    const { org, organizationId, plautiCloudApiKey } = params;

    const prodOrgId = await this.orgInfoClient.getOrgId(org);
    const result = await this.plautiCloudClient.unlinkSandbox(organizationId, prodOrgId, plautiCloudApiKey);

    return {
      status: result.status
    };
  }
}