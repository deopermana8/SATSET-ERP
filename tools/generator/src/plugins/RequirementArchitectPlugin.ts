import { BasePlugin } from "../sdk/BasePlugin.js";
import { ArchitectContextLike, GeneratedArtifact, GeneratorContextLike, GeneratorRunResult, NormalizedBlueprint, PluginKnowledge } from "../sdk/contracts.js";

export default class RequirementArchitectPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["architect", "domain-pack", "blueprint"],
      dependencies: [],
      description: "Convert business requirements into normalized blueprints.",
      name: "RequirementArchitectPlugin",
      priority: 300,
      targets: ["module", "dashboard", "report", "mobile", "scanner", "entity"],
      version: "3.0.0"
    });
  }

  async architect(context: ArchitectContextLike): Promise<NormalizedBlueprint | null> {
    const requirement = context.requirement.toLowerCase();
    const moduleName = this.pickModuleName(context.requirement);
    const domainKeywords = this.extractEntities(requirement);

    return context.createBlueprint({
      description: `Blueprint for ${context.requirement}`,
      entities: domainKeywords.map((entity) => ({ name: entity, label: entity })),
      entity: domainKeywords[0] ?? "Record",
      metadata: {
        origin: "RequirementArchitectPlugin",
        requirement: context.requirement
      },
      module: moduleName
    });
  }

  async afterGenerate(context: GeneratorContextLike, result: GeneratorRunResult): Promise<void> {
    await super.afterGenerate(context as never, result);
  }

  async beforeGenerate(context: GeneratorContextLike): Promise<void> {
    await super.beforeGenerate(context as never);
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    void context;
    return [];
  }

  async knowledge(): Promise<PluginKnowledge[]> {
    return this.manifest.capabilities.map((capability) => ({
      capability,
      description: this.manifest.description,
      plugin: this.manifest.name
    }));
  }

  dependencies(): readonly string[] {
    return [];
  }

  async validate(context: GeneratorContextLike): Promise<void> {
    await super.validate(context as never);
  }

  private extractEntities(requirement: string): string[] {
    const dictionary: Array<{ entity: string; tokens: string[] }> = [
      { entity: "Reservasi", tokens: ["wisata", "hotel", "restoran"] },
      { entity: "Pembayaran", tokens: ["finance", "erp", "hotel", "crm", "wisata"] },
      { entity: "Transaksi", tokens: ["erp", "pos", "wisata", "parkir", "finance"] },
      { entity: "Pelanggan", tokens: ["crm", "hotel", "restoran", "wisata"] },
      { entity: "Inventori", tokens: ["inventory", "purchasing", "pos", "restoran"] },
      { entity: "Karyawan", tokens: ["hr", "erp", "hotel"] }
    ];

    const matches = dictionary.filter((item) => item.tokens.some((token) => requirement.includes(token))).map((item) => item.entity);
    return matches.length > 0 ? matches : ["Record"];
  }

  private pickModuleName(requirement: string): string {
    return requirement.replace(/^buat\s+/i, "").trim() || "Factory";
  }
}
