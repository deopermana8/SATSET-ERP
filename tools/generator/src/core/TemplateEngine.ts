import { TemplateTask, GeneratedArtifact } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";
import { TemplateRenderer } from "./TemplateRenderer.js";

export interface ITemplateEngine {
  renderInline(template: string, model: Record<string, unknown>): string;
  renderTemplate(templateName: string, model: Record<string, unknown>): string;
  renderTasks(pluginName: string, tasks: readonly TemplateTask[], model: Record<string, unknown>, generatorRoot: string, outputRoot: string): Promise<GeneratedArtifact[]>;
}

export class TemplateEngine implements ITemplateEngine {
  private readonly fileSystem = new FileSystem();
  private readonly renderer = new TemplateRenderer();
  private readonly templateCache = new Map<string, string>();

  renderInline(template: string, model: Record<string, unknown>): string {
    return this.renderer.render(template, model);
  }

  renderTemplate(templateName: string, model: Record<string, unknown>): string {
    const content = this.getTemplateContent(templateName, model.generatorRoot as string);
    return this.renderer.render(content, model);
  }

  async renderTasks(pluginName: string, tasks: readonly TemplateTask[], model: Record<string, unknown>, generatorRoot: string, outputRoot: string): Promise<GeneratedArtifact[]> {
    const artifacts: GeneratedArtifact[] = [];

    for (const task of tasks) {
      if (task.conditionPath && !this.resolveBoolean(task.conditionPath, model)) {
        continue;
      }

      const mergedModel = {
        ...model,
        ...(task.model ?? {})
      };
      const renderedPath = this.renderInline(task.output, mergedModel);
      const absoluteOutputPath = path.isAbsolute(renderedPath) ? renderedPath : path.join(outputRoot, renderedPath);
      const renderedContent = this.renderTemplate(task.template, {
        ...mergedModel,
        generatorRoot
      });
      this.fileSystem.writeText(absoluteOutputPath, `${renderedContent.trimEnd()}\n`);
      artifacts.push({
        contentHash: this.fileSystem.hash(renderedContent),
        outputPath: absoluteOutputPath,
        plugin: pluginName,
        template: task.template
      });
    }

    return artifacts;
  }

  private getTemplateContent(templateName: string, generatorRoot: string): string {
    const cacheKey = `${generatorRoot}:${templateName}`;
    const cached = this.templateCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const templatePath = path.join(generatorRoot, "templates", templateName);
    const content = this.fileSystem.readText(templatePath);
    this.templateCache.set(cacheKey, content);
    return content;
  }

  private resolveBoolean(pathExpression: string, model: Record<string, unknown>): boolean {
    const segments = pathExpression.split(".").filter((segment) => segment.length > 0);
    let current: unknown = model;

    for (const segment of segments) {
      if (typeof current !== "object" || current === null || !(segment in (current as Record<string, unknown>))) {
        return false;
      }
      current = (current as Record<string, unknown>)[segment];
    }

    return Boolean(current);
  }
}
