export interface EngineManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  category: string;
  priority: number;
  enabled: boolean;
  timeout: number;
  retryPolicy: {
    retries: number;
    backoff: number;
  };
  dependencies: string[];
  before?: string[];
  after?: string[];
  tags: string[];
}

export interface ManifestAwareEngine {
  getManifest(): EngineManifest;
}
