import { promises as fs } from "fs";
import crypto from "crypto";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface PrismaMetadata {
  prismaFolderExists: boolean;
  schemaExists: boolean;
  schemaPath: string | null;
  schemaFolder?: string | null;
  schemaCount?: number;
  generatorProvider: string | null;
  generatorOutput: string | null;
  datasourceProvider: string | null;
  datasourceUrl: string | null;
  engineType: string | null;
  modelCount: number;
  modelNames: string[];
  generatedPrismaExists: boolean;
  generatedPrismaPath: string | null;
  generatedHash: string | null;
  runtimeLibraryExists: boolean;
  runtimeLibraryPath: string | null;
  runtimeExists: boolean;
  libraryDtsSize: number | null;
  libraryLineCount: number | null;
  libraryHash: string | null;
  indexDtsExists: boolean;
  indexDtsPath: string | null;
  indexDtsSize: number | null;
  indexLineCount: number | null;
  indexHash: string | null;
  hasRuntimeFolder: boolean;
  hasGeneratorFolder: boolean;
  hasBinary: boolean;
  hasQueryEngine: boolean;
  hasSchemaModels: boolean;
  hasDatasource: boolean;
  hasGenerator: boolean;
  hasNamespacePrisma: boolean;
  hasPrismaClient: boolean;
  hasKnownRequestError: boolean;
  hasPrismaPromise: boolean;
  prismaVersion: string | null;
  generatorPackageVersion: string | null;
  clientPackageVersion: string | null;
  schemaHash: string | null;
}

export class PrismaScanner implements IScanner {
  public readonly name = "PrismaScanner";

  public async scan(context: Context): Promise<void> {
    const root = context.projectRoot;
    const prismaDir = path.join(root, "prisma");
    let schemaPath = path.join(prismaDir, "schema.prisma");
    const generatedPrismaDir = path.join(root, "node_modules", ".prisma", "client");
    const runtimeLibraryPath = path.join(generatedPrismaDir, "runtime", "library.d.ts");
    const indexDtsPath = path.join(generatedPrismaDir, "index.d.ts");
    const packageJsonPath = path.join(root, "package.json");

    const metadata: PrismaMetadata = {
      prismaFolderExists: false,
      schemaExists: false,
      schemaFolder: null,
      schemaPath: null,
      generatorProvider: null,
      generatorOutput: null,
      datasourceProvider: null,
      datasourceUrl: null,
      engineType: null,
      modelCount: 0,
      modelNames: [],
      generatedPrismaExists: false,
      generatedPrismaPath: null,
      generatedHash: null,
      runtimeLibraryExists: false,
      runtimeLibraryPath: null,
      runtimeExists: false,
      libraryDtsSize: null,
      libraryLineCount: null,
      libraryHash: null,
      indexDtsExists: false,
      indexDtsPath: null,
      indexDtsSize: null,
      indexLineCount: null,
      indexHash: null,
      hasRuntimeFolder: false,
      hasGeneratorFolder: false,
      hasBinary: false,
      hasQueryEngine: false,
      hasSchemaModels: false,
      hasDatasource: false,
      hasGenerator: false,
      hasNamespacePrisma: false,
      hasPrismaClient: false,
      hasKnownRequestError: false,
      hasPrismaPromise: false,
      prismaVersion: null,
      generatorPackageVersion: null,
      clientPackageVersion: null,
      schemaHash: null,
      schemaCount: 0,
    };

    const tryAccess = async (targetPath: string): Promise<boolean> => {
      try {
        await fs.access(targetPath);
        return true;
      } catch {
        return false;
      }
    };

    const parseBlock = (content: string, blockType: string): string | null => {
      const match = content.match(new RegExp(`${blockType}\\s+\\w+\\s*\\{([\\s\\S]*?)\\}`, "i"));
      return match ? match[1] : null;
    };

    const parseProperty = (block: string | null, key: string): string | null => {
      if (!block) {
        return null;
      }

      const match = block.match(new RegExp(`${key}\\s*=\\s*("([^"]*)"|[^\\s]+)`, "i"));
      if (!match) {
        return null;
      }

      const value = match[1].trim();
      return value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
    };

    const hashString = (value: string): string =>
      crypto.createHash("sha256").update(value, "utf8").digest("hex");

    const findSchemaFiles = async (start: string, maxDepth = 5): Promise<string[]> => {
      const results: string[] = [];

      const walk = async (dir: string, depth: number): Promise<void> => {
        if (depth > maxDepth) return;
        let entries;
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
          return;
        }

        for (const entry of entries) {
          const resPath = path.join(dir, entry.name);
          if (entry.isFile() && entry.name === "schema.prisma") {
            results.push(resPath);
          } else if (entry.isDirectory()) {
            await walk(resPath, depth + 1);
          }
        }
      };

      await walk(start, 0);
      return results;
    };

    const readSchema = async (): Promise<void> => {
      // perform recursive search for schema.prisma up to depth 5
      const found = await findSchemaFiles(root, 5);
      metadata.schemaCount = found.length;

      if (found.length === 0) {
        // fallback to default path if exists
        const existsDefault = await tryAccess(schemaPath);
        if (!existsDefault) {
          metadata.schemaExists = false;
          metadata.schemaPath = null;
          metadata.schemaFolder = null as unknown as string | null;
          return;
        }
        schemaPath = schemaPath;
      } else if (found.length === 1) {
        schemaPath = found[0];
      } else {
        // choose the one that has a generator named 'client'
        let chosen: string | null = null;
        for (const p of found) {
          try {
            const c = await fs.readFile(p, "utf-8");
            if (/generator\s+client\s*\{/i.test(c)) {
              chosen = p;
              break;
            }
          } catch {
            // ignore
          }
        }

        schemaPath = chosen ?? found[0];
      }

      const exists = await tryAccess(schemaPath);
      if (!exists) {
        metadata.schemaExists = false;
        metadata.schemaPath = null;
        metadata.schemaFolder = null as unknown as string | null;
        return;
      }

      metadata.schemaExists = true;
      metadata.schemaPath = schemaPath;
      metadata.schemaFolder = path.dirname(schemaPath);

      const content = await fs.readFile(schemaPath, "utf-8");
      metadata.schemaHash = hashString(content);

      const generatorBlock = parseBlock(content, "generator");
      const datasourceBlock = parseBlock(content, "datasource");

      metadata.generatorProvider = parseProperty(generatorBlock, "provider");
      metadata.generatorOutput = parseProperty(generatorBlock, "output");
      metadata.engineType = parseProperty(generatorBlock, "engineType");
      metadata.datasourceProvider = parseProperty(datasourceBlock, "provider");
      metadata.datasourceUrl = parseProperty(datasourceBlock, "url");
      metadata.hasDatasource = datasourceBlock !== null;
      metadata.hasGenerator = generatorBlock !== null;

      const modelNames = Array.from(content.matchAll(/^\s*model\s+([A-Za-z0-9_]+)\s*\{/gm)).map((match) => match[1]);
      metadata.modelNames = modelNames;
      metadata.modelCount = modelNames.length;
      metadata.hasSchemaModels = modelNames.length > 0;
    };

    const loadPackageVersion = async (): Promise<void> => {
      const exists = await tryAccess(packageJsonPath);
      if (!exists) {
        return;
      }

      const content = await fs.readFile(packageJsonPath, "utf-8");
      const parsed = JSON.parse(content) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      metadata.prismaVersion = parsed.dependencies?.prisma ?? parsed.devDependencies?.prisma ?? null;
      metadata.generatorPackageVersion = metadata.prismaVersion;
      metadata.clientPackageVersion = parsed.dependencies?.["@prisma/client"] ?? parsed.devDependencies?.["@prisma/client"] ?? null;
    };

    const readGeneratedMetadata = async (): Promise<void> => {
      metadata.hasGeneratorFolder = await tryAccess(path.join(generatedPrismaDir, "generator"));
      metadata.hasRuntimeFolder = await tryAccess(path.join(generatedPrismaDir, "runtime"));
      metadata.runtimeExists = metadata.hasRuntimeFolder;

      metadata.generatedPrismaExists = await tryAccess(generatedPrismaDir);
      metadata.generatedPrismaPath = metadata.generatedPrismaExists ? generatedPrismaDir : null;

      if (metadata.generatedPrismaExists) {
        try {
          const entries = await fs.readdir(generatedPrismaDir);
          metadata.generatedHash = hashString(entries.sort().join(","));
          metadata.hasBinary = entries.some((entry) => /query_engine|libquery_engine|prisma-engine/i.test(entry));
          metadata.hasQueryEngine = metadata.hasBinary || entries.some((entry) => /engine/i.test(entry));
        } catch {
          metadata.generatedHash = null;
          metadata.hasBinary = false;
          metadata.hasQueryEngine = false;
        }
      }
    };

    const readRuntimeFiles = async (): Promise<void> => {
      metadata.runtimeLibraryExists = await tryAccess(runtimeLibraryPath);
      metadata.runtimeLibraryPath = metadata.runtimeLibraryExists ? runtimeLibraryPath : null;
      metadata.indexDtsExists = await tryAccess(indexDtsPath);
      metadata.indexDtsPath = metadata.indexDtsExists ? indexDtsPath : null;

      if (metadata.runtimeLibraryExists) {
        const content = await fs.readFile(runtimeLibraryPath, "utf-8");
        metadata.libraryDtsSize = Buffer.byteLength(content, "utf8");
        metadata.libraryLineCount = content.split(/\r?\n/).length;
        metadata.libraryHash = hashString(content);
        metadata.hasNamespacePrisma = /export\s+declare\s+namespace\s+Prisma/.test(content);
        metadata.hasPrismaClient = /class\s+PrismaClient/.test(content);
        metadata.hasKnownRequestError = /PrismaClientKnownRequestError/.test(content);
        metadata.hasPrismaPromise = /PrismaPromise/.test(content);
      }

      if (metadata.indexDtsExists) {
        const content = await fs.readFile(indexDtsPath, "utf-8");
        metadata.indexDtsSize = Buffer.byteLength(content, "utf8");
        metadata.indexLineCount = content.split(/\r?\n/).length;
        metadata.indexHash = hashString(content);
      }
    };

    const populateMetadata = async (): Promise<void> => {
      metadata.prismaFolderExists = await tryAccess(prismaDir);
      await readSchema();
      await loadPackageVersion();
      await readGeneratedMetadata();
      await readRuntimeFiles();

      const existingMetadata = context.metadata as Record<string, unknown>;
      (context as unknown as { metadata: Record<string, unknown> }).metadata = {
        ...existingMetadata,
        prisma: metadata,
      };
    };

    await populateMetadata();
  }
}
