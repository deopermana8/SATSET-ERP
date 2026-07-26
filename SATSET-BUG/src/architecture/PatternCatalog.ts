export interface PatternCatalogEntry {
  id: string;
  name: string;
  description: string;
}

export class PatternCatalog {
  getCatalog(): PatternCatalogEntry[] {
    return [
      { id: "modular-monolith", name: "Modular Monolith", description: "Good default for medium-sized projects" },
      { id: "ddd", name: "DDD", description: "Good when domain complexity is high" },
      { id: "hexagonal", name: "Hexagonal", description: "Good for testable boundaries" },
    ];
  }
}
