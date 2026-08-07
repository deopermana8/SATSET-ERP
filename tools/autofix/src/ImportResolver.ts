import { ImportResolverService, ProjectInfo } from "./types.js";

type PathModule = {
  basename(filePath: string): string;
  dirname(filePath: string): string;
  extname(filePath: string): string;
  relative(from: string, to: string): string;
  resolve(...paths: string[]): string;
};

const path = require("node:path") as PathModule;

export interface IImportResolver extends ImportResolverService {}

export class ImportResolver implements IImportResolver {
  resolveRelativeImport(fromFile: string, toFile: string): string {
    const sourceDirectory = path.dirname(path.resolve(fromFile));
    const targetFile = path.resolve(toFile);
    let relativePath = path.relative(sourceDirectory, targetFile).replace(/\\/g, "/");

    if (!relativePath.startsWith(".")) {
      relativePath = `./${relativePath}`;
    }

    return this.stripKnownExtension(relativePath);
  }

  resolveImportTarget(fromFile: string, importSpecifier: string, project: ProjectInfo): string | undefined {
    const normalizedSpecifier = importSpecifier.replace(/\\/g, "/");
    const candidates = project.importableFiles.filter((candidate) => this.matchesSpecifier(fromFile, normalizedSpecifier, candidate));
    if (candidates.length === 0) {
      return undefined;
    }

    return candidates.sort((left, right) => this.scoreCandidate(fromFile, right) - this.scoreCandidate(fromFile, left))[0];
  }

  private matchesSpecifier(fromFile: string, importSpecifier: string, candidate: string): boolean {
    const normalizedCandidate = candidate.replace(/\\/g, "/");
    const withoutExtension = this.stripKnownExtension(normalizedCandidate);
    const sourceDirectory = path.dirname(path.resolve(fromFile));

    if (importSpecifier.startsWith(".")) {
      const resolvedPath = this.stripKnownExtension(path.resolve(sourceDirectory, importSpecifier).replace(/\\/g, "/"));
      return withoutExtension === resolvedPath || withoutExtension === `${resolvedPath}/index`;
    }

    const segments = importSpecifier.split("/").filter((segment) => segment.length > 0);
    const tail = segments.slice(-Math.min(segments.length, 3)).join("/");
    return withoutExtension.endsWith(`/${tail}`) || withoutExtension.endsWith(`/${tail}/index`) || path.basename(withoutExtension) === segments[segments.length - 1];
  }

  private scoreCandidate(fromFile: string, candidate: string): number {
    const fromSegments = path.dirname(path.resolve(fromFile)).replace(/\\/g, "/").split("/");
    const candidateSegments = candidate.replace(/\\/g, "/").split("/");
    let sharedSegments = 0;

    while (sharedSegments < fromSegments.length && sharedSegments < candidateSegments.length) {
      if (fromSegments[sharedSegments] !== candidateSegments[sharedSegments]) {
        break;
      }
      sharedSegments += 1;
    }

    return sharedSegments * 1000 - candidateSegments.length;
  }

  private stripKnownExtension(importPath: string): string {
    const match = importPath.match(/(\.d\.ts|\.tsx|\.ts|\.jsx|\.js|\.mjs|\.cjs)$/);
    if (!match) {
      return importPath;
    }

    return importPath.slice(0, -match[1].length);
  }
}
