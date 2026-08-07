export type CrudEntity = {
  id: string;
  name: string;
  status: string;
  [key: string]: unknown;
};

export type CrudListResult<T extends CrudEntity> = {
  items: T[];
  total: number;
};
