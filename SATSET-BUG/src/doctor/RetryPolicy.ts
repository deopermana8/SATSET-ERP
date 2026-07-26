export interface RetryPolicy {
  maxAttempts: number;
  retryDelayMs: number;
}

export class DefaultRetryPolicy implements RetryPolicy {
  readonly maxAttempts = 4;
  readonly retryDelayMs = 0;
}
