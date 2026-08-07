export interface ITemplateRenderer {
  render(template: string, model: Record<string, unknown>): string;
}

export class TemplateRenderer implements ITemplateRenderer {
  render(template: string, model: Record<string, unknown>): string {
    return this.renderTemplate(template, model);
  }

  private renderTemplate(template: string, model: Record<string, unknown>): string {
    let output = template;
    output = this.renderEachBlocks(output, model);
    output = this.renderIfBlocks(output, model);
    output = this.renderVariables(output, model);
    return output;
  }

  private renderEachBlocks(template: string, model: Record<string, unknown>): string {
    const pattern = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g;
    return template.replace(pattern, (_, expression: string, content: string) => {
      const value = this.resolveExpression(expression.trim(), model);
      if (!Array.isArray(value)) {
        return "";
      }

      return value.map((item, index) => {
        const childModel = {
          ...model,
          this: item,
          index
        } as Record<string, unknown>;
        return this.renderTemplate(content, childModel);
      }).join("");
    });
  }

  private renderIfBlocks(template: string, model: Record<string, unknown>): string {
    const pattern = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
    return template.replace(pattern, (_, expression: string, content: string) => {
      const value = this.resolveExpression(expression.trim(), model);
      return value ? this.renderTemplate(content, model) : "";
    });
  }

  private renderVariables(template: string, model: Record<string, unknown>): string {
    const pattern = /{{\s*([^#/][^}]*)\s*}}/g;
    return template.replace(pattern, (_, expression: string) => {
      const value = this.resolveExpression(expression.trim(), model);
      if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        return JSON.stringify(value, null, 2);
      }
      return typeof value === "undefined" || value === null ? "" : String(value);
    });
  }

  private resolveExpression(expression: string, model: Record<string, unknown>): unknown {
    if (expression === "." || expression === "this") {
      return model.this;
    }

    const segments = expression.split(".").filter((segment) => segment.length > 0);
    let current: unknown = model;

    for (const segment of segments) {
      if (typeof current !== "object" || current === null || !(segment in (current as Record<string, unknown>))) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[segment];
    }

    return current;
  }
}
