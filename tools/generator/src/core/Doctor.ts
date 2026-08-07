import { DiagnosticItem, DoctorReport, GeneratorPlugin } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";
import { DependencyGraph } from "./DependencyGraph.js";

export interface DoctorContext {
  buildLogPath: string;
  generatorRoot: string;
  pluginRoot: string;
  plugins: readonly GeneratorPlugin[];
  projectRoot: string;
}

export interface IDoctor {
  run(context: DoctorContext): Promise<DoctorReport>;
}

export class Doctor implements IDoctor {
  private readonly fileSystem = new FileSystem();
  private readonly dependencyGraph = new DependencyGraph();

  async run(context: DoctorContext): Promise<DoctorReport> {
    const diagnostics: DiagnosticItem[] = [];
    diagnostics.push(this.checkBinary("Node", process.argv[0] ?? "node"));
    diagnostics.push(this.checkFile("Workspace", context.projectRoot));
    diagnostics.push(this.checkFile("TypeScript", path.join(context.generatorRoot, "tsconfig.json")));
    diagnostics.push(this.checkFile("Prisma", path.join(context.projectRoot, "prisma", "schema.prisma")));
    diagnostics.push(this.checkFile("Generator Registry", context.pluginRoot));
    diagnostics.push(this.checkRegistry("Plugin Registry", context.plugins));
    diagnostics.push(this.checkAlias("Alias", path.join(context.projectRoot, "lib")));
    diagnostics.push(this.checkImport("Import", path.join(context.projectRoot, "tools", "autofix", "src", "ImportResolver.ts")));
    diagnostics.push(this.checkFile("Missing File", path.join(context.generatorRoot, "package.json")));
    diagnostics.push(this.checkCycles("Circular Dependency", context.plugins));
    diagnostics.push(this.checkFile("package.json", path.join(context.generatorRoot, "package.json")));
    diagnostics.push(this.checkFile("tsconfig", path.join(context.generatorRoot, "tsconfig.json")));
    diagnostics.push(this.checkOptionalFile("build.log", context.buildLogPath));
    diagnostics.push(this.checkOptionalFile("PNPM", path.join(context.projectRoot, "pnpm-lock.yaml")));
    return {
      diagnostics,
      ok: diagnostics.every((item) => item.ok)
    };
  }

  private checkBinary(subject: string, value: string): DiagnosticItem {
    return {
      category: "runtime",
      code: "binary",
      message: value.length > 0 ? `${subject} detected` : `${subject} not detected`,
      ok: value.length > 0,
      subject
    };
  }

  private checkFile(subject: string, filePath: string): DiagnosticItem {
    return {
      category: "filesystem",
      code: "exists",
      message: this.fileSystem.exists(filePath) ? `${subject} ready` : `${subject} missing`,
      ok: this.fileSystem.exists(filePath),
      subject
    };
  }

  private checkOptionalFile(subject: string, filePath: string): DiagnosticItem {
    return {
      category: "filesystem",
      code: "optional",
      message: this.fileSystem.exists(filePath) ? `${subject} found` : `${subject} not found`,
      ok: true,
      subject
    };
  }

  private checkRegistry(subject: string, plugins: readonly GeneratorPlugin[]): DiagnosticItem {
    return {
      category: "registry",
      code: "plugin-count",
      message: `${plugins.length} plugin(s) discovered`,
      ok: plugins.length > 0,
      subject
    };
  }

  private checkAlias(subject: string, aliasPath: string): DiagnosticItem {
    return {
      category: "workspace",
      code: "alias-root",
      message: this.fileSystem.exists(aliasPath) ? `Alias root found at ${aliasPath}` : `Alias root missing at ${aliasPath}`,
      ok: this.fileSystem.exists(aliasPath),
      subject
    };
  }

  private checkImport(subject: string, resolverPath: string): DiagnosticItem {
    return {
      category: "workspace",
      code: "import-resolver",
      message: this.fileSystem.exists(resolverPath) ? "Import resolver found" : "Import resolver missing",
      ok: this.fileSystem.exists(resolverPath),
      subject
    };
  }

  private checkCycles(subject: string, plugins: readonly GeneratorPlugin[]): DiagnosticItem {
    const cycles = this.dependencyGraph.detectCycles(plugins);
    return {
      category: "graph",
      code: "cycles",
      message: cycles.length === 0 ? "No cycles detected" : `Cycles detected in ${cycles.join(", ")}`,
      ok: cycles.length === 0,
      subject
    };
  }
}
