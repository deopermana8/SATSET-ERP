import { promises as fs } from "fs";
import path from "path";
import fastGlob from "fast-glob";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface DependencyGraphMetadata {
  exists: boolean;
  totalPackages: number;
  duplicatePackages: string[];
  workspacePackages: string[];
  peerDependencies: string[];
  optionalDependencies: string[];
  devDependencies: string[];
  dependencyTree: Record<string, Record<string, string[]>>;
  circularCandidates: string[][];
  unusedCandidates: string[];
  versionConflicts: Record<string, string[]>;
}

interface PackageInfo {
  name: string;
  path: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  optionalDependencies: Record<string, string>;
}

export class DependencyGraphScanner implements IScanner {
  public readonly name = "DependencyGraphScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const rootPackagePath = path.join(root, "package.json");

    const metadata: DependencyGraphMetadata = {
      exists: false,
      totalPackages: 0,
      duplicatePackages: [],
      workspacePackages: [],
      peerDependencies: [],
      optionalDependencies: [],
      devDependencies: [],
      dependencyTree: {},
      circularCandidates: [],
      unusedCandidates: [],
      versionConflicts: {},
    };

    if (!(await this.fileExists(rootPackagePath))) {
      (context.metadata as Record<string, unknown>)["dependencies"] = metadata;
      return;
    }

    metadata.exists = true;

    const rootPackage = await this.readPackageJson(rootPackagePath);
    if (!rootPackage) {
      (context.metadata as Record<string, unknown>)["dependencies"] = metadata;
      return;
    }

    const workspacePackagePaths = await this.resolveWorkspacePackageJsons(root, rootPackage);
    const packageInfos: PackageInfo[] = [];

    const rootPackageInfo = this.createPackageInfo(rootPackage, rootPackagePath);
    if (rootPackageInfo) {
      packageInfos.push(rootPackageInfo);
    }

    for (const packagePath of workspacePackagePaths) {
      const packageJson = await this.readPackageJson(packagePath);
      if (!packageJson) {
        continue;
      }
      const packageInfo = this.createPackageInfo(packageJson, packagePath);
      if (packageInfo) {
        packageInfos.push(packageInfo);
      }
    }

    const packageNameCounts = new Map<string, number>();
    const peerDependencies = new Map<string, Set<string>>();
    const optionalDependencies = new Map<string, Set<string>>();
    const devDependencies = new Map<string, Set<string>>();
    const dependencyTree: Record<string, Record<string, string[]>> = {};
    const dependencyEdges = new Map<string, Set<string>>();
    const dependencyVersions = new Map<string, Set<string>>();

    for (const info of packageInfos) {
      packageNameCounts.set(info.name, (packageNameCounts.get(info.name) ?? 0) + 1);

      const allDeps = {
        dependencies: info.dependencies,
        devDependencies: info.devDependencies,
        peerDependencies: info.peerDependencies,
        optionalDependencies: info.optionalDependencies,
      };

      dependencyTree[info.name] = {
        dependencies: Object.keys(info.dependencies),
        devDependencies: Object.keys(info.devDependencies),
        peerDependencies: Object.keys(info.peerDependencies),
        optionalDependencies: Object.keys(info.optionalDependencies),
      };

      for (const [type, deps] of Object.entries(allDeps) as Array<[keyof PackageInfo, Record<string, string>]>) {
        for (const [name, version] of Object.entries(deps)) {
          if (type === "peerDependencies") {
            this.addVersion(peerDependencies, name, version);
          }
          if (type === "optionalDependencies") {
            this.addVersion(optionalDependencies, name, version);
          }
          if (type === "devDependencies") {
            this.addVersion(devDependencies, name, version);
          }
          this.addVersion(dependencyVersions, name, version);
          this.addEdge(dependencyEdges, info.name, name);
        }
      }
    }

    metadata.totalPackages = packageNameCounts.size;
    metadata.duplicatePackages = [...packageNameCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name);
    metadata.workspacePackages = packageInfos
      .slice(1)
      .map((info) => info.name)
      .filter(Boolean);
    metadata.peerDependencies = [...peerDependencies.keys()];
    metadata.optionalDependencies = [...optionalDependencies.keys()];
    metadata.devDependencies = [...devDependencies.keys()];
    metadata.dependencyTree = dependencyTree;
    metadata.versionConflicts = this.buildVersionConflicts(dependencyVersions);
    metadata.circularCandidates = this.findCircularCandidates(packageInfos, dependencyEdges);
    metadata.unusedCandidates = this.findUnusedCandidates(packageInfos, dependencyEdges);

    (context.metadata as Record<string, unknown>)["dependencies"] = metadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readPackageJson(packagePath: string): Promise<Record<string, unknown> | null> {
    try {
      const content = await fs.readFile(packagePath, "utf-8");
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private createPackageInfo(packageJson: Record<string, unknown>, packagePath: string): PackageInfo | null {
    const name = typeof packageJson.name === "string" ? packageJson.name : path.basename(path.dirname(packagePath));
    if (!name) {
      return null;
    }

    return {
      name,
      path: packagePath,
      dependencies: this.extractDependencies(packageJson.dependencies),
      devDependencies: this.extractDependencies(packageJson.devDependencies),
      peerDependencies: this.extractDependencies(packageJson.peerDependencies),
      optionalDependencies: this.extractDependencies(packageJson.optionalDependencies),
    };
  }

  private extractDependencies(value: unknown): Record<string, string> {
    if (!value || typeof value !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, version]) => typeof version === "string")
        .map(([name, version]) => [name, version as string])
    );
  }

  private async resolveWorkspacePackageJsons(root: string, rootPackage: Record<string, unknown>): Promise<string[]> {
    const patterns = this.getWorkspacePatterns(rootPackage);
    if (patterns.length === 0) {
      return [];
    }

    const lookupPatterns = patterns.map((pattern) => `${pattern.replace(/\/*$/, "")}/package.json`);
    return await fastGlob(lookupPatterns, { cwd: root, absolute: true, onlyFiles: true });
  }

  private getWorkspacePatterns(rootPackage: Record<string, unknown>): string[] {
    const workspaces = rootPackage.workspaces;
    if (Array.isArray(workspaces)) {
      return workspaces.map((item) => String(item));
    }

    if (workspaces && typeof workspaces === "object" && Array.isArray((workspaces as Record<string, unknown>).packages)) {
      return ((workspaces as Record<string, unknown>).packages as unknown[]).map((item) => String(item));
    }

    return [];
  }

  private addVersion(map: Map<string, Set<string>>, name: string, version: string): void {
    if (!map.has(name)) {
      map.set(name, new Set());
    }
    map.get(name)?.add(version);
  }

  private addEdge(edges: Map<string, Set<string>>, from: string, to: string): void {
    if (!edges.has(from)) {
      edges.set(from, new Set());
    }
    edges.get(from)?.add(to);
  }

  private buildVersionConflicts(versions: Map<string, Set<string>>): Record<string, string[]> {
    const conflicts: Record<string, string[]> = {};
    for (const [name, versionSet] of versions) {
      if (versionSet.size > 1) {
        conflicts[name] = [...versionSet].sort();
      }
    }
    return conflicts;
  }

  private findCircularCandidates(packageInfos: PackageInfo[], edges: Map<string, Set<string>>): string[][] {
    const names = packageInfos.map((info) => info.name);
    const graph = new Map(edges);
    const visited = new Set<string>();
    const stack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
      if (stack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      stack.add(node);
      const dependencies = graph.get(node) ?? new Set();
      for (const next of dependencies) {
        if (names.includes(next)) {
          dfs(next, [...path, next]);
        }
      }
      stack.delete(node);
    };

    for (const name of names) {
      dfs(name, [name]);
    }

    return cycles;
  }

  private findUnusedCandidates(packageInfos: PackageInfo[], edges: Map<string, Set<string>>): string[] {
    const declared = new Set<string>();
    const referenced = new Set<string>();

    for (const info of packageInfos) {
      declared.add(info.name);
      for (const dep of Object.keys(info.dependencies)) {
        referenced.add(dep);
      }
      for (const dep of Object.keys(info.devDependencies)) {
        referenced.add(dep);
      }
      for (const dep of Object.keys(info.peerDependencies)) {
        referenced.add(dep);
      }
      for (const dep of Object.keys(info.optionalDependencies)) {
        referenced.add(dep);
      }
    }

    const unused: string[] = [];
    for (const name of declared) {
      if (!referenced.has(name) || !this.isReferencedByAny(edges, name)) {
        unused.push(name);
      }
    }

    return unused;
  }

  private isReferencedByAny(edges: Map<string, Set<string>>, name: string): boolean {
    for (const [, deps] of edges) {
      if (deps.has(name)) {
        return true;
      }
    }
    return false;
  }
}
