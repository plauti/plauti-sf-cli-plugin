export interface LinkSandboxRequest {
  sandboxOrgId: string;
  prodOrgId: string;
  username: string;
  sandboxName: string;
  apiKey: string;
}

export interface LinkResult {
  status: string;
}

export interface SandboxInfo {
  [key: string]: unknown;
}

export interface UnlinkResult {
  status: string;
}

export interface PlautiCloudClient {
  linkSandbox(request: LinkSandboxRequest): Promise<LinkResult>;
  listSandboxes(orgId: string, apiKey: string): Promise<SandboxInfo[]>;
  unlinkSandbox(sandboxId: string, prodId: string, apiKey: string): Promise<UnlinkResult>;
}

export class PlautiCloudClientImpl implements PlautiCloudClient {
  async linkSandbox(request: LinkSandboxRequest): Promise<LinkResult> {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${request.sandboxOrgId}/${request.prodOrgId}`, {
      method: 'PUT',
      headers: {
        'Authorization': request.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: request.username,
        sandboxName: request.sandboxName
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return { status: 'done' };
  }

  async listSandboxes(orgId: string, apiKey: string): Promise<SandboxInfo[]> {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${orgId}`, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.json();
    return content as SandboxInfo[];
  }

  async unlinkSandbox(sandboxId: string, prodId: string, apiKey: string): Promise<UnlinkResult> {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://cloud.plauti.com/public-api/rest-v1/sandbox-license/${sandboxId}/${prodId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return { status: 'done' };
  }
}