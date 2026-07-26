import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface BackendOutput {
  restApi: string[];
  controllers: string[];
  services: string[];
  validation: string[];
  authentication: string[];
  authorization: string[];
  dto: string[];
  types: string[];
  openApi: string[];
}

interface ReasoningMetadata {
  entities?: string[];
  useCases?: string[];
  apiSpec?: string[];
}

export class BackendGenerator implements IEngine {
  public readonly name = "BackendGenerator";

  async run(context: Context): Promise<void> {
    const reasoning = this.getReasoning(context);
    const resourceSlug = this.getResourceSlug(context, reasoning);
    const resourceLabel = this.getResourceLabel(context, reasoning);
    const controllerName = this.getControllerName(resourceSlug);
    const serviceName = this.getServiceName(resourceSlug);
    const useCases = reasoning?.useCases?.length ? reasoning.useCases : ["Create resource", "List resources"];
    const routes = reasoning?.apiSpec?.length ? reasoning.apiSpec : [`GET /${resourceSlug}`, `POST /${resourceSlug}`];

    const backend: BackendOutput = {
      restApi: routes,
      controllers: [controllerName],
      services: [serviceName],
      validation: ["Blueprint-driven validation", "Error handling"],
      authentication: ["JWT auth"],
      authorization: ["RBAC"],
      dto: [`${resourceLabel}Dto`],
      types: [`${resourceLabel}Type`],
      openApi: [`OpenAPI spec generated for ${resourceLabel}`],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    const controllerTemplate = path.join(context.projectRoot, "templates", "resource.controller.ts.tpl");
    const controllerPath = path.join(context.projectRoot, "src", "api", resourceSlug, `${resourceSlug}.controller.ts`);
    const routerPath = path.join(context.projectRoot, "src", "api", resourceSlug, `${resourceSlug}.router.ts`);
    const serviceTemplate = path.join(context.projectRoot, "templates", "resource.service.ts.tpl");
    const servicePath = path.join(context.projectRoot, "src", "api", resourceSlug, `${resourceSlug}.service.ts`);

    await pipeline.run(context, [{
      id: `${resourceSlug}-controller`,
      name: `${resourceSlug}-controller`,
      templatePath: controllerTemplate,
      outputPath: controllerPath,
      variables: {
        ControllerName: controllerName,
        ServiceName: serviceName,
        resourceName: resourceSlug,
        resourceLabel,
        useCasesList: JSON.stringify(useCases),
        routesList: JSON.stringify(routes),
      },
    }, {
      id: `${resourceSlug}-router`,
      name: `${resourceSlug}-router`,
      templatePath: controllerTemplate,
      outputPath: routerPath,
      variables: {
        ControllerName: controllerName,
        ServiceName: serviceName,
        resourceName: resourceSlug,
        resourceLabel,
        useCasesList: JSON.stringify(useCases),
        routesList: JSON.stringify(routes),
      },
    }, {
      id: `${resourceSlug}-service`,
      name: `${resourceSlug}-service`,
      templatePath: serviceTemplate,
      outputPath: servicePath,
      variables: {
        ServiceName: serviceName,
        resourceName: resourceSlug,
        resourceLabel,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      backend,
    } as typeof context.metadata & { backend?: BackendOutput };
  }

  private getReasoning(context: Context): ReasoningMetadata | null {
    const metadata = context.metadata as Record<string, unknown> | undefined;
    const reasoning = metadata?.reasoning;
    if (reasoning && typeof reasoning === "object") {
      return reasoning as ReasoningMetadata;
    }
    return null;
  }

  private getResourceSlug(context: Context, reasoning: ReasoningMetadata | null): string {
    const entity = reasoning?.entities?.[0]?.trim();
    if (entity) {
      const slug = entity
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toLowerCase()
        .replace(/^-|-$/g, "");
      return this.pluralize(slug || "resource");
    }

    const metadata = (context.metadata as Record<string, unknown> | undefined) ?? {};
    const idea = typeof metadata.idea === "string" ? metadata.idea.toLowerCase() : "";
    if (idea.includes("product") || idea.includes("commerce") || idea.includes("shop") || idea.includes("inventory")) {
      return "products";
    }
    if (idea.includes("auth") || idea.includes("user")) {
      return "users";
    }
    if (idea.includes("backend") || idea.includes("api") || idea.includes("service")) {
      return "health";
    }

    const explicit = [metadata.resourceName, metadata.entityName, metadata.resource, metadata.module, metadata.idea, metadata.projectName]
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .find(Boolean);

    if (explicit) {
      const normalized = explicit
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toLowerCase()
        .replace(/^-|-$/g, "");
      if (normalized) {
        return this.pluralize(normalized);
      }
    }

    return "health";
  }

  private getResourceLabel(context: Context, reasoning: ReasoningMetadata | null): string {
    const entity = reasoning?.entities?.[0]?.trim();
    if (entity) {
      return entity.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    }

    const metadata = (context.metadata as Record<string, unknown> | undefined) ?? {};
    const explicit = [metadata.resourceName, metadata.entityName, metadata.resource, metadata.module, metadata.idea]
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .find(Boolean);

    if (explicit) {
      return explicit.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    }

    return "Health";
  }

  private getControllerName(resourceSlug: string): string {
    const base = resourceSlug
      .split("-")
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join("");
    return `${base}Controller`;
  }

  private getServiceName(resourceSlug: string): string {
    const base = resourceSlug
      .split("-")
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join("");
    return `${base}Service`;
  }

  private pluralize(value: string): string {
    if (value.endsWith("s")) {
      return value;
    }
    if (value.endsWith("y") && !/[aeiou]y$/i.test(value)) {
      return `${value.slice(0, -1)}ies`;
    }
    if (value.endsWith("ch") || value.endsWith("sh") || value.endsWith("x") || value.endsWith("z")) {
      return `${value}es`;
    }
    return `${value}s`;
  }
}
