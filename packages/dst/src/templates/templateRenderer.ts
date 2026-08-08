import Handlebars from "handlebars";

import { loadTemplate, loadTemplateSync } from "./templateLoader.js";

export type TemplateRenderData = Record<string, unknown>;

export async function renderTemplate(
  name: string,
  data: TemplateRenderData,
  templatesDir?: string
): Promise<string> {
  const source = await loadTemplate(name, templatesDir);

  try {
    const compiled = Handlebars.compile(source, { noEscape: false });
    return compiled(data);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to render template \"${name}\": ${details}`);
  }
}

export function renderTemplateSync(
  name: string,
  data: TemplateRenderData,
  templatesDir?: string
): string {
  const source = loadTemplateSync(name, templatesDir);

  try {
    const compiled = Handlebars.compile(source, { noEscape: false });
    return compiled(data);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to render template "${name}": ${details}`);
  }
}
