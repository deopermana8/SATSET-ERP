import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface DatabaseOutput {
  erd: string[];
  prismaSchema: string[];
  migrations: string[];
  seed: string[];
  indexes: string[];
  relations: string[];
  validation: string[];
}

interface ReasoningMetadata {
  entities?: string[];
}

export class DatabaseGenerator implements IEngine {
  public readonly name = "DatabaseGenerator";

  async run(context: Context): Promise<void> {
    const reasoning = this.getReasoning(context);
    const entities = reasoning?.entities?.length ? reasoning.entities : ["User", "Project"];
    const models = entities
      .map((entity) => `model ${entity.replace(/\s+/g, "")} { id String @id @default(cuid()) }`)
      .join("\n\n");

    const database: DatabaseOutput = {
      erd: entities.map((entity) => `${entity}`),
      prismaSchema: entities.map((entity) => `model ${entity} { id String @id }`),
      migrations: entities.map((entity) => `create_${entity.toLowerCase()}_table`),
      seed: ["seed admin user"],
      indexes: ["@@index([id])"],
      relations: entities.length > 1 ? [`${entities[0]} has many ${entities[1]}`] : ["core entity"],
      validation: ["Schema compiles", "Relations are consistent"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    const schemaTemplate = path.join(context.projectRoot, "templates", "schema.prisma.tpl");
    const schemaOutput = path.join(context.projectRoot, "prisma", "schema.prisma");

    await pipeline.run(context, [{
      id: "prisma-schema",
      name: "prisma-schema",
      templatePath: schemaTemplate,
      outputPath: schemaOutput,
      variables: {
        models,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      database,
    } as typeof context.metadata & { database?: DatabaseOutput };
  }

  private getReasoning(context: Context): ReasoningMetadata | null {
    const metadata = context.metadata as Record<string, unknown> | undefined;
    const reasoning = metadata?.reasoning;
    if (reasoning && typeof reasoning === "object") {
      return reasoning as ReasoningMetadata;
    }
    return null;
  }
}
