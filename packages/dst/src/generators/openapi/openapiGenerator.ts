import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { openapiTemplateName, toOpenApiOutputPath, toOpenApiTemplateData } from "./openapiTemplate.js";

export function generateOpenApi(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`OpenAPI generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(openapiTemplateName, toOpenApiTemplateData(spec));

  return {
    path: toOpenApiOutputPath(spec),
    content
  };
}
