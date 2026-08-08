import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { dtoTemplateName, toDtoOutputPath, toDtoTemplateData } from "./dtoTemplate.js";

export function generateDto(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`DTO generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(dtoTemplateName, toDtoTemplateData(spec));

  return {
    path: toDtoOutputPath(spec),
    content
  };
}
