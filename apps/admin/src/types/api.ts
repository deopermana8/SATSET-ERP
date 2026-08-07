export type ApiResult<T> = {
  data: T | null;
  status: number;
  ok: boolean;
};

export type ApiError = {
  message: string;
  status: number;
};
