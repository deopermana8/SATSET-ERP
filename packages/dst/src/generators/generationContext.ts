import type { DstSpec } from "../types/index.js";

export interface TemplateTarget {
  templateName: string;
  outputPath: string;
}

export interface GeneratorContext {
  spec: DstSpec;
  templates: TemplateTarget[];
  templateData: {
    version: string;
    domain: DstSpec["domain"];
    fields: DstSpec["fields"];
    requiredFields: DstSpec["fields"];
    optionalFields: DstSpec["fields"];
    fieldCount: number;
  };
  templatesDir?: string;
}

export interface GenerateOptions {
  templates: TemplateTarget[];
  templatesDir?: string;
}

function assertTemplateTarget(target: TemplateTarget, index: number): void {
  if (!target.templateName || !target.templateName.trim()) {
    throw new Error(`Invalid template target at index ${index}: templateName is required`);
  }

  if (!target.outputPath || !target.outputPath.trim()) {
    throw new Error(`Invalid template target at index ${index}: outputPath is required`);
  }
}

export function prepareGenerationContext(spec: DstSpec, options: GenerateOptions): GeneratorContext {
  if (!Array.isArray(options.templates) || options.templates.length === 0) {
    throw new Error("Generation templates are required and cannot be empty");
  }

  options.templates.forEach((target, index) => {
    assertTemplateTarget(target, index);
  });

  const fields = spec.fields;
  const requiredFields = fields.filter((field) => field.required);
  const optionalFields = fields.filter((field) => !field.required);

  return {
    spec,
    templates: options.templates,
    templateData: {
      version: spec.version,
      domain: spec.domain,
      fields,
      requiredFields,
      optionalFields,
      fieldCount: fields.length
    },
    templatesDir: options.templatesDir
  };
}
