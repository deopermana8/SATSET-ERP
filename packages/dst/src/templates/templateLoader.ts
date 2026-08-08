import { access, readFile } from "node:fs/promises";
import { accessSync, constants as fsConstants, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
const defaultTemplatesDir = resolve(currentDir, "../../templates");

function normalizeTemplateName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Template name is required and cannot be empty");
  }

  if (trimmed.includes("..") || trimmed.includes("\\") || trimmed.startsWith("/")) {
    throw new Error(`Template name \"${name}\" is invalid. Use a relative file name without path traversal.`);
  }

  return extname(trimmed) ? trimmed : `${trimmed}.hbs`;
}

export function resolveTemplatePath(name: string, templatesDir: string = defaultTemplatesDir): string {
  const normalized = normalizeTemplateName(name);
  return resolve(templatesDir, normalized);
}

export async function loadTemplate(name: string, templatesDir: string = defaultTemplatesDir): Promise<string> {
  const templatePath = resolveTemplatePath(name, templatesDir);

  try {
    await access(templatePath, fsConstants.R_OK);
  } catch {
    throw new Error(
      `Template not found: \"${name}\". Expected at ${templatePath}`
    );
  }

  try {
    return await readFile(templatePath, "utf8");
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load template \"${name}\": ${details}`);
  }
}

export function loadTemplateSync(name: string, templatesDir: string = defaultTemplatesDir): string {
  const templatePath = resolveTemplatePath(name, templatesDir);

  try {
    accessSync(templatePath, fsConstants.R_OK);
  } catch {
    throw new Error(`Template not found: \"${name}\". Expected at ${templatePath}`);
  }

  try {
    return readFileSync(templatePath, "utf8");
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load template \"${name}\": ${details}`);
  }
}
