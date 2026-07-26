import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ProjectGenerator } from "./ProjectGenerator.js";
import { BackendGenerator } from "./BackendGenerator.js";
import { FrontendGenerator } from "./FrontendGenerator.js";
import { ApiGenerator } from "./ApiGenerator.js";
import { DatabaseGenerator } from "./DatabaseGenerator.js";
import { MigrationGenerator } from "./MigrationGenerator.js";
import { EntityGenerator } from "./EntityGenerator.js";
import { RepositoryGenerator } from "./RepositoryGenerator.js";
import { ServiceGenerator } from "./ServiceGenerator.js";
import { ControllerGenerator } from "./ControllerGenerator.js";
import { ModuleGenerator } from "./ModuleGenerator.js";
import { RouteGenerator } from "./RouteGenerator.js";
import { MiddlewareGenerator } from "./MiddlewareGenerator.js";
import { AuthenticationGenerator } from "./AuthenticationGenerator.js";
import { AuthorizationGenerator } from "./AuthorizationGenerator.js";
import { ValidationGenerator } from "./ValidationGenerator.js";
import { ConfigGenerator } from "./ConfigGenerator.js";
import { LoggerGenerator } from "./LoggerGenerator.js";
import { QueueGenerator } from "./QueueGenerator.js";
import { CacheGenerator } from "./CacheGenerator.js";
import { EventGenerator } from "./EventGenerator.js";
import { DockerGenerator } from "./DockerGenerator.js";
import { ComposeGenerator } from "./ComposeGenerator.js";
import { KubernetesGenerator } from "./KubernetesGenerator.js";
import { CIGenerator } from "./CIGenerator.js";
import { TestGenerator } from "./TestGenerator.js";
import { DocumentationGenerator } from "./DocumentationGenerator.js";
import { SeederGenerator } from "./SeederGenerator.js";
import { MockGenerator } from "./MockGenerator.js";

export interface GenerationSnapshot {
  files: string[];
  services: string[];
  endpoints: string[];
  entities: string[];
  tests: string[];
  modules: string[];
}

export class GenerationEngine implements IEngine {
  public readonly name = "GenerationEngine";

  async run(context: Context): Promise<void> {
    const project = new ProjectGenerator();
    const backend = new BackendGenerator();
    const frontend = new FrontendGenerator();
    const api = new ApiGenerator();
    const database = new DatabaseGenerator();
    const migration = new MigrationGenerator();
    const entity = new EntityGenerator();
    const repository = new RepositoryGenerator();
    const service = new ServiceGenerator();
    const controller = new ControllerGenerator();
    const module = new ModuleGenerator();
    const route = new RouteGenerator();
    const middleware = new MiddlewareGenerator();
    const authentication = new AuthenticationGenerator();
    const authorization = new AuthorizationGenerator();
    const validation = new ValidationGenerator();
    const config = new ConfigGenerator();
    const logger = new LoggerGenerator();
    const queue = new QueueGenerator();
    const cache = new CacheGenerator();
    const event = new EventGenerator();
    const docker = new DockerGenerator();
    const compose = new ComposeGenerator();
    const kubernetes = new KubernetesGenerator();
    const ci = new CIGenerator();
    const tests = new TestGenerator();
    const documentation = new DocumentationGenerator();
    const seeder = new SeederGenerator();
    const mock = new MockGenerator();

    const files = [
      ...project.generate(context),
      ...backend.generate(context),
      ...frontend.generate(context),
      ...api.generate(context),
      ...database.generate(context),
      ...migration.generate(context),
      ...entity.generate(context),
      ...repository.generate(context),
      ...service.generate(context),
      ...controller.generate(context),
      ...module.generate(context),
      ...route.generate(context),
      ...middleware.generate(context),
      ...authentication.generate(context),
      ...authorization.generate(context),
      ...validation.generate(context),
      ...config.generate(context),
      ...logger.generate(context),
      ...queue.generate(context),
      ...cache.generate(context),
      ...event.generate(context),
      ...docker.generate(context),
      ...compose.generate(context),
      ...kubernetes.generate(context),
      ...ci.generate(context),
      ...tests.generate(context),
      ...documentation.generate(context),
      ...seeder.generate(context),
      ...mock.generate(context),
    ];

    const snapshot: GenerationSnapshot = {
      files,
      services: files.filter((file) => file.includes("service")),
      endpoints: files.filter((file) => file.includes("route") || file.includes("controller") || file.includes("api")),
      entities: files.filter((file) => file.includes("entity")),
      tests: files.filter((file) => file.includes("test") || file.includes("spec")),
      modules: files.filter((file) => file.includes("module")),
    };

    const outputPath = path.join(context.projectRoot, "knowledge", "generated-files.json");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2), "utf8");
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "generated-services.json"), JSON.stringify({ services: snapshot.services }, null, 2), "utf8");
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "generated-api.json"), JSON.stringify({ endpoints: snapshot.endpoints }, null, 2), "utf8");
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "generated-schema.json"), JSON.stringify({ entities: snapshot.entities }, null, 2), "utf8");
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "generated-tests.json"), JSON.stringify({ tests: snapshot.tests }, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      generation: snapshot,
    } as typeof context.metadata & { generation?: GenerationSnapshot };
  }
}
