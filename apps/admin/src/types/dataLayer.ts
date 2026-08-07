export type DataRequestInit = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  cacheTtlMs?: number;
  noCache?: boolean;
};

export type DataLayerConfig = {
  apiBaseUrl: string;
  defaultTimeoutMs: number;
  defaultRetries: number;
  defaultRetryDelayMs: number;
  defaultCacheTtlMs: number;
};

export type DataLayerError = Error & {
  code?: "HTTP_ERROR" | "TIMEOUT" | "ABORTED" | "NETWORK_ERROR";
  status?: number;
  path?: string;
};

export type DataLayerLoadingState = {
  pending: number;
};

export type DataLayerErrorState = {
  error: DataLayerError;
};
