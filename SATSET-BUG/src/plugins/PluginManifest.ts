export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  enabled: boolean;
  engines: string[];
  dependencies: string[];
  permissions: string[];
  capabilities: string[];
}
