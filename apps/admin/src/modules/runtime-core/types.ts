export type RuntimeItem = { id: string; name: string; status: string };

export type RuntimeListResponse<TItem extends RuntimeItem = RuntimeItem> = {
  data: TItem[];
  total: number;
};

export type RuntimeRequest = <T>(path: string, init?: {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  cacheTtlMs?: number;
  noCache?: boolean;
}) => Promise<T | null>;

export type RuntimeRepository<TItem extends RuntimeItem = RuntimeItem> = {
  list: () => Promise<RuntimeListResponse<TItem>>;
  detail: (id: string) => Promise<TItem | null>;
  create: (payload: Partial<TItem>) => Promise<TItem | null>;
  update: (id: string, payload: Partial<TItem>) => Promise<TItem | null>;
  remove: (id: string) => Promise<void>;
};

export type RuntimeService<TItem extends RuntimeItem = RuntimeItem> = {
  load: () => Promise<RuntimeListResponse<TItem>>;
  create: (payload: Partial<TItem>) => Promise<TItem | null>;
  update: (id: string, payload: Partial<TItem>) => Promise<TItem | null>;
  remove: (id: string) => Promise<void>;
};

export type RuntimeState<TItem extends RuntimeItem = RuntimeItem> = {
  items: TItem[];
  total: number;
  loading: boolean;
  error: string | null;
};
