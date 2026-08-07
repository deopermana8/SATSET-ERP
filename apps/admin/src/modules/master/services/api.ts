import { apiFetch } from "../../../services/api.js";
import type { MasterRecord } from "../crud/types.js";

export async function loadMasterItems<T extends MasterRecord>(apiUrl: string, entity: string): Promise<T[]> {
  return (await apiFetch<T[]>(apiUrl, `/erp-wisata/${entity}`)) ?? [];
}
