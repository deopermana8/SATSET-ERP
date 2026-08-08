import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";

import {
  serviceTemplateName,
  toServiceOutputPath,
  toServiceTemplateData
} from "./serviceTemplate.js";

export function generateService(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Service generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(serviceTemplateName, toServiceTemplateData(spec));

  return {
    path: toServiceOutputPath(spec),
    content
  };
}
