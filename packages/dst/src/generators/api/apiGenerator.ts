import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { apiTemplateName, toApiOutputPath, toApiTemplateData } from "./apiTemplate.js";

export function generateApi(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`API generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(apiTemplateName, toApiTemplateData(spec));

  return {
    path: toApiOutputPath(spec),
    content
  };
}
