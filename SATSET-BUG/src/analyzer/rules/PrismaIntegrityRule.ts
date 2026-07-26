import type { Context } from "../../core/Context.js";
import type { IRule } from "../IRule.js";
import type { Issue } from "../../core/Issue.js";
import type { Evidence } from "../../core/Evidence.js";
import type { FixSuggestion } from "../../core/FixSuggestion.js";
import { Severity } from "../../core/Severity.js";

export class PrismaIntegrityRule implements IRule {
  public readonly id = "prisma-integrity-failed";
  public readonly name = "Prisma Integrity Rule";
  public readonly category = "Prisma";

  public match(context: Context): boolean {
    const prisma = context.metadata.prisma as Record<string, unknown> | undefined;

    if (!prisma) {
      return false;
    }

    return [
      prisma.hasNamespacePrisma === false,
      prisma.hasPrismaClient === false,
      prisma.hasKnownRequestError === false,
      prisma.hasPrismaPromise === false,
      prisma.runtimeExists === false,
      prisma.generatedPrismaExists === false,
      prisma.schemaExists === false,
      prisma.hasGenerator === false,
      prisma.hasDatasource === false,
    ].some(Boolean);
  }

  public analyze(context: Context): void {
    const prisma = context.metadata.prisma as Record<string, unknown> | undefined;
    const failedFields: string[] = [];

    if (!prisma || prisma.hasNamespacePrisma === false) {
      failedFields.push("hasNamespacePrisma");
    }
    if (!prisma || prisma.hasPrismaClient === false) {
      failedFields.push("hasPrismaClient");
    }
    if (!prisma || prisma.hasKnownRequestError === false) {
      failedFields.push("hasKnownRequestError");
    }
    if (!prisma || prisma.hasPrismaPromise === false) {
      failedFields.push("hasPrismaPromise");
    }
    if (!prisma || prisma.runtimeExists === false) {
      failedFields.push("runtimeExists");
    }
    if (!prisma || prisma.generatedPrismaExists === false) {
      failedFields.push("generatedPrismaExists");
    }
    if (!prisma || prisma.schemaExists === false) {
      failedFields.push("schemaExists");
    }
    if (!prisma || prisma.hasGenerator === false) {
      failedFields.push("hasGenerator");
    }
    if (!prisma || prisma.hasDatasource === false) {
      failedFields.push("hasDatasource");
    }

    const evidenceFile = prisma?.schemaExists === false ? "schema.prisma" : "library.d.ts";
    const evidence: Evidence[] = [
      {
        id: "prisma-integrity-source",
        type: "file",
        file: evidenceFile,
        description: `Integrity indication from Prisma metadata for ${evidenceFile}`,
      },
    ];

    const issue: Issue = {
      id: "prisma-integrity-failed",
      title: "Prisma Client Integrity Failed",
      category: "Prisma",
      severity: Severity.Critical,
      message: `Prisma metadata failed integrity checks: ${failedFields.join(", ")}`,
      evidence,
      fixes: [
        {
          id: "generate-prisma-client",
          title: "Generate ulang Prisma Client",
          description: "Regenerate the Prisma Client to restore integrity.",
          risk: "low",
          automatic: false,
          steps: ["Run prisma generate in the project root."],
        },
      ],
    };

    const contextAny = context as unknown as { issues?: Issue[] };
    if (!Array.isArray(contextAny.issues)) {
      contextAny.issues = [];
    }

    contextAny.issues.push(issue);
  }
}
