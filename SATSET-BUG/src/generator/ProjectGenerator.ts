export class ProjectGenerator {
  generate(): string[] {
    return ["src/index.ts", "package.json", "tsconfig.json"];
  }
}
