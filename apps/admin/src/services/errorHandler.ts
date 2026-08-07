import type { DataLayerError } from "../types/dataLayer.js";

export type DataLayerErrorHandler = (error: DataLayerError) => void;

export function normalizeDataLayerError(error: unknown, path: string, status?: number): DataLayerError {
  const fallback = new Error("Unknown data layer error") as DataLayerError;
  const normalized = (error instanceof Error ? error : fallback) as DataLayerError;
  normalized.path = path;
  if (typeof status === "number") {
    normalized.status = status;
    normalized.code = "HTTP_ERROR";
  }
  if (!normalized.code && normalized.name === "AbortError") {
    normalized.code = "ABORTED";
  }
  return normalized;
}

export function createDataLayerErrorHandler(handler?: DataLayerErrorHandler): DataLayerErrorHandler {
  return (error: DataLayerError) => {
    if (handler) {
      handler(error);
    }
  };
}
