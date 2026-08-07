import type { DashboardCounts } from "../types/dashboard.js";
import { fetchCrudList } from "./crud.js";

const modules = ["destinasi", "reservasi", "hotel", "guide", "kendaraan", "pembayaran", "kas", "jurnal"] as const;

type DashboardModule = (typeof modules)[number];

export async function fetchDashboardCounts(apiUrl: string): Promise<DashboardCounts> {
  const entries = await Promise.all(
    modules.map(async (moduleName) => {
      const result = await fetchCrudList(apiUrl, moduleName);
      return [moduleName, result.total] as const;
    }),
  );

  return entries.reduce<DashboardCounts>((acc, [moduleName, total]) => {
    acc[moduleName as DashboardModule] = total;
    return acc;
  }, {
    destinasi: 0,
    reservasi: 0,
    hotel: 0,
    guide: 0,
    kendaraan: 0,
    pembayaran: 0,
    kas: 0,
    jurnal: 0,
  });
}
