export interface Evidence {
  id: string;
  type: string;
  file: string;
  line?: number;
  column?: number;
  expected?: string;
  actual?: string;
  snippet?: string;
  description?: string;
}
