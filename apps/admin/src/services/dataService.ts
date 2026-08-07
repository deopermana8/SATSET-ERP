import { createHttpRepository } from "../repositories/httpRepository.js";
import type { DataLayerConfig, DataRequestInit } from "../types/dataLayer.js";

export function createDataService(config: DataLayerConfig) {
  const repository = createHttpRepository(config);
  return {
    request<T>(path: string, init?: DataRequestInit): Promise<T | null> {
      return repository.request<T>(path, init);
    },
    clearCache(prefix?: string): void {
      repository.clearCache(prefix);
    },
    dispose(): void {
      repository.abortAll("service-dispose");
    },
  };
}
