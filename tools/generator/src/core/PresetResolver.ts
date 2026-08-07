import { SatsetPresetTarget } from "../sdk/contracts.js";

export interface PresetDefinition {
  blueprintType: "module" | "dashboard" | "report" | "mobile" | "scanner";
  name: string;
}

export interface IPresetResolver {
  resolve(target: SatsetPresetTarget): PresetDefinition;
}

export class PresetResolver implements IPresetResolver {
  private readonly presets: Record<SatsetPresetTarget, PresetDefinition> = {
    "master-data": { blueprintType: "module", name: "Master Data" },
    analytics: { blueprintType: "dashboard", name: "Analytics" },
    cafe: { blueprintType: "module", name: "Cafe" },
    crm: { blueprintType: "dashboard", name: "CRM" },
    customer: { blueprintType: "module", name: "Customer" },
    dashboard: { blueprintType: "dashboard", name: "Dashboard" },
    destination: { blueprintType: "module", name: "Destination" },
    employee: { blueprintType: "module", name: "Employee" },
    erp: { blueprintType: "module", name: "ERP" },
    finance: { blueprintType: "module", name: "Finance" },
    hotel: { blueprintType: "module", name: "Hotel" },
    hr: { blueprintType: "module", name: "HR" },
    inventory: { blueprintType: "module", name: "Inventory" },
    laporan: { blueprintType: "report", name: "Laporan" },
    loyalty: { blueprintType: "module", name: "Loyalty" },
    membership: { blueprintType: "module", name: "Membership" },
    notification: { blueprintType: "module", name: "Notification" },
    parkir: { blueprintType: "module", name: "Parkir" },
    pos: { blueprintType: "module", name: "POS" },
    purchasing: { blueprintType: "module", name: "Purchasing" },
    reporting: { blueprintType: "report", name: "Reporting" },
    reservation: { blueprintType: "module", name: "Reservation" },
    restaurant: { blueprintType: "module", name: "Restaurant" },
    restoran: { blueprintType: "module", name: "Restoran" },
    souvenir: { blueprintType: "module", name: "Souvenir" },
    supplier: { blueprintType: "module", name: "Supplier" },
    ticket: { blueprintType: "module", name: "Ticket" },
    vendor: { blueprintType: "module", name: "Vendor" },
    visitor: { blueprintType: "module", name: "Visitor" },
    warehouse: { blueprintType: "module", name: "Warehouse" },
    workflow: { blueprintType: "module", name: "Workflow" },
    wisata: { blueprintType: "module", name: "Wisata" }
  };

  resolve(target: SatsetPresetTarget): PresetDefinition {
    return this.presets[target];
  }
}
