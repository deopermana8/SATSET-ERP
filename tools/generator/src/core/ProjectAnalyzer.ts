import { GeneratorPlugin, ProjectModel } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { getFastGlob } from "../utils/Node.js";

export interface IProjectAnalyzer {
  analyze(projectRoot: string, generatorPlugins: readonly GeneratorPlugin[]): Promise<ProjectModel>;
}

export class ProjectAnalyzer implements IProjectAnalyzer {
  private readonly fileSystem = new FileSystem();

  async analyze(projectRoot: string, generatorPlugins: readonly GeneratorPlugin[]): Promise<ProjectModel> {
    const fastGlob = getFastGlob();
    let model: ProjectModel = {
      buildLogs: await fastGlob(["tools/autofix/*.log", "tools/autofix/logs/*.log"], { absolute: true, cwd: projectRoot, dot: false, ignore: [], onlyFiles: true, suppressErrors: true, unique: true }),
      dependencyGraph: generatorPlugins.map((plugin) => ({ dependencies: [...plugin.dependencies()], name: plugin.manifest.name })),
      eslintFiles: await fastGlob(["**/.eslintrc*", "eslint.config.*"], { absolute: true, cwd: projectRoot, dot: true, ignore: ["**/node_modules/**"], onlyFiles: true, suppressErrors: true, unique: true }),
      generatorPlugins: generatorPlugins.map((plugin) => plugin.manifest.name),
      nextConfigFiles: await fastGlob(["**/next.config.*"], { absolute: true, cwd: projectRoot, dot: false, ignore: ["**/node_modules/**"], onlyFiles: true, suppressErrors: true, unique: true }),
      packageJsonFiles: await fastGlob(["**/package.json"], { absolute: true, cwd: projectRoot, dot: false, ignore: ["**/node_modules/**"], onlyFiles: true, suppressErrors: true, unique: true }),
      pnpmFiles: await fastGlob(["**/pnpm-lock.yaml", "**/pnpm-workspace.yaml"], { absolute: true, cwd: projectRoot, dot: false, ignore: ["**/node_modules/**"], onlyFiles: true, suppressErrors: true, unique: true }),
      prismaFiles: await fastGlob(["**/*.prisma"], { absolute: true, cwd: projectRoot, dot: false, ignore: ["**/node_modules/**"], onlyFiles: true, suppressErrors: true, unique: true }),
      reactFiles: await fastGlob(["**/*.{tsx,jsx}"], { absolute: true, cwd: projectRoot, dot: false, ignore: ["**/node_modules/**"], onlyFiles: true, suppressErrors: true, unique: true }),
      tsconfigFiles: await fastGlob(["**/tsconfig*.json"], { absolute: true, cwd: projectRoot, dot: false, ignore: ["**/node_modules/**"], onlyFiles: true, suppressErrors: true, unique: true }),
      workspaceRoot: projectRoot
    };

    for (const plugin of generatorPlugins) {
      if (plugin.analyzeProject) {
        model = await plugin.analyzeProject(model, { generatorRoot: projectRoot, projectRoot });
      }
    }

    return model;
  }
}
