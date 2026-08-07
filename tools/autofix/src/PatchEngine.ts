import { JsonValue, PatchOperation, PatchPlan, PatchResult, ProjectInfo } from "./types.js";

interface FileSystemModule {
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  readFileSync(path: string, encoding: string): string;
  writeFileSync(path: string, content: string, encoding: string): void;
}

interface PathModule {
  dirname(filePath: string): string;
}

interface NamedNodeLike {
  getName?(): string;
  getProperty?(name: string): NamedNodeLike | undefined;
  addProperty?(options: { name: string; type: string; hasQuestionToken?: boolean }): void;
  getParameters?(): NamedNodeLike[];
  rename?(newName: string): void;
  setType?(value: string): void;
  remove?(): void;
  getText?(): string;
}

interface ImportDeclarationLike {
  getModuleSpecifierValue(): string;
  setModuleSpecifier(value: string): void;
}

interface SourceFileLike {
  getImportDeclarations(): ImportDeclarationLike[];
  getDescendants(): NamedNodeLike[];
  getDescendantsOfKind(kind: number): NamedNodeLike[];
  getInterfaces(): NamedNodeLike[];
  getClasses(): NamedNodeLike[];
  getTypeAliases(): NamedNodeLike[];
  getFunctions(): NamedNodeLike[];
  saveSync(): void;
}

interface TsMorphProject {
  addSourceFileAtPathIfExists(filePath: string): SourceFileLike | undefined;
}

interface TsMorphProjectConstructor {
  new (options?: {
    skipAddingFilesFromTsConfig?: boolean;
    skipFileDependencyResolution?: boolean;
  }): TsMorphProject;
}

interface SyntaxKindModule {
  Identifier: number;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

export interface IPatchEngine {
  apply(projectInfo: ProjectInfo, patchPlan: PatchPlan): PatchResult;
  getAstProject(): TsMorphProject;
}

export class PatchEngine implements IPatchEngine {
  private astProject?: TsMorphProject;

  constructor(private readonly projectInfo: ProjectInfo) {
    void this.projectInfo;
  }

  getAstProject(): TsMorphProject {
    if (!this.astProject) {
      const tsMorph = require("ts-morph") as {
        Project: TsMorphProjectConstructor;
      };

      this.astProject = new tsMorph.Project({
        skipAddingFilesFromTsConfig: true,
        skipFileDependencyResolution: true
      });
    }

    return this.astProject;
  }

  apply(projectInfo: ProjectInfo, patchPlan: PatchPlan): PatchResult {
    void projectInfo;
    const startedAt = Date.now();
    const touchedFiles = new Set<string>();
    const errors: string[] = [];
    let applied = false;

    for (const operation of patchPlan.operations) {
      try {
        const changed = this.applyOperation(operation);
        if (changed) {
          applied = true;
          touchedFiles.add(operation.file);
        }
      }
      catch (error: unknown) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    return {
      applied,
      ruleName: patchPlan.ruleName,
      summary: patchPlan.summary,
      files: Array.from(touchedFiles),
      durationMs: Date.now() - startedAt,
      errors
    };
  }

  private applyOperation(operation: PatchOperation): boolean {
    switch (operation.kind) {
      case "update-import":
        return this.updateImport(operation.file, operation.currentValue, this.asString(operation.nextValue));
      case "update-type":
        return this.updateType(operation.file, operation.targetName, this.asString(operation.nextValue), operation.propertyName);
      case "rename-identifier":
        return this.renameIdentifier(operation.file, operation.targetName, this.asString(operation.nextValue));
      case "insert-property":
        return this.insertProperty(operation.file, operation.targetName, operation.propertyName, operation.propertyType, operation.optional);
      case "remove-property":
        return this.removeProperty(operation.file, operation.targetName, operation.propertyName);
      case "update-json":
        return this.updateJson(operation.file, operation.jsonPath, operation.nextValue);
      case "write-file":
        return this.writeFile(operation.file, operation.nextValue);
      default:
        return false;
    }
  }

  private updateImport(filePath: string, currentValue: string | undefined, nextValue: string): boolean {
    if (!currentValue || nextValue.length === 0) {
      return false;
    }

    const sourceFile = this.getSourceFile(filePath);
    const importDeclaration = sourceFile?.getImportDeclarations().find((item) => item.getModuleSpecifierValue() === currentValue);
    if (!sourceFile || !importDeclaration) {
      return false;
    }

    importDeclaration.setModuleSpecifier(nextValue);
    sourceFile.saveSync();
    return true;
  }

  private updateType(filePath: string, targetName: string | undefined, nextValue: string, propertyName?: string): boolean {
    if (!targetName || nextValue.length === 0) {
      return false;
    }

    const sourceFile = this.getSourceFile(filePath);
    if (!sourceFile) {
      return false;
    }

    if (propertyName) {
      const container = this.findContainer(sourceFile, targetName);
      const property = container?.getProperty?.(propertyName);
      if (property?.setType) {
        property.setType(nextValue);
        sourceFile.saveSync();
        return true;
      }
    }

    for (const node of sourceFile.getDescendants()) {
      if (node.getName?.() === targetName && node.setType) {
        node.setType(nextValue);
        sourceFile.saveSync();
        return true;
      }
    }

    for (const functionNode of sourceFile.getFunctions()) {
      for (const parameter of functionNode.getParameters?.() ?? []) {
        if (parameter.getName?.() === targetName && parameter.setType) {
          parameter.setType(nextValue);
          sourceFile.saveSync();
          return true;
        }
      }
    }

    return false;
  }

  private renameIdentifier(filePath: string, currentValue: string | undefined, nextValue: string): boolean {
    if (!currentValue || nextValue.length === 0) {
      return false;
    }

    const sourceFile = this.getSourceFile(filePath);
    if (!sourceFile) {
      return false;
    }

    const tsMorph = require("ts-morph") as { SyntaxKind: SyntaxKindModule };
    let changed = false;

    for (const identifier of sourceFile.getDescendantsOfKind(tsMorph.SyntaxKind.Identifier)) {
      if (identifier.getText?.() === currentValue && identifier.rename) {
        identifier.rename(nextValue);
        changed = true;
      }
    }

    if (changed) {
      sourceFile.saveSync();
    }

    return changed;
  }

  private insertProperty(filePath: string, targetName: string | undefined, propertyName: string | undefined, propertyType: string | undefined, optional = false): boolean {
    if (!targetName || !propertyName || !propertyType) {
      return false;
    }

    const sourceFile = this.getSourceFile(filePath);
    const container = sourceFile ? this.findContainer(sourceFile, targetName) : undefined;
    if (!sourceFile || !container?.addProperty || container.getProperty?.(propertyName)) {
      return false;
    }

    container.addProperty({
      name: propertyName,
      type: propertyType,
      hasQuestionToken: optional
    });
    sourceFile.saveSync();
    return true;
  }

  private removeProperty(filePath: string, targetName: string | undefined, propertyName: string | undefined): boolean {
    if (!targetName || !propertyName) {
      return false;
    }

    const sourceFile = this.getSourceFile(filePath);
    const container = sourceFile ? this.findContainer(sourceFile, targetName) : undefined;
    const property = container?.getProperty?.(propertyName);
    if (!sourceFile || !property?.remove) {
      return false;
    }

    property.remove();
    sourceFile.saveSync();
    return true;
  }

  private updateJson(filePath: string, jsonPath: string[] | undefined, nextValue: JsonValue | undefined): boolean {
    if (!jsonPath || typeof nextValue === "undefined") {
      return false;
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8")) as { [key: string]: JsonValue };
    let currentNode: { [key: string]: JsonValue } = json;

    for (let index = 0; index < jsonPath.length - 1; index += 1) {
      const segment = jsonPath[index];
      const nextNode = currentNode[segment];
      if (!this.isJsonObject(nextNode)) {
        currentNode[segment] = {};
      }
      currentNode = currentNode[segment] as { [key: string]: JsonValue };
    }

    currentNode[jsonPath[jsonPath.length - 1]] = nextValue;
    fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    return true;
  }

  private writeFile(filePath: string, nextValue: JsonValue | undefined): boolean {
    if (typeof nextValue !== "string") {
      return false;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, nextValue, "utf8");
    return true;
  }

  private findContainer(sourceFile: SourceFileLike, targetName: string): NamedNodeLike | undefined {
    return [...sourceFile.getInterfaces(), ...sourceFile.getClasses(), ...sourceFile.getTypeAliases()]
      .find((node) => node.getName?.() === targetName);
  }

  private getSourceFile(filePath: string): SourceFileLike | undefined {
    return this.getAstProject().addSourceFileAtPathIfExists(filePath);
  }

  private asString(value: JsonValue | undefined): string {
    return typeof value === "string" ? value : "";
  }

  private isJsonObject(value: JsonValue | undefined): value is { [key: string]: JsonValue } {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
