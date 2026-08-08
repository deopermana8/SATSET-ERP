import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { moduleTemplateName, toModuleOutputPath, toModuleTemplateData } from "./moduleTemplate.js";

export function generateModule(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Module generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(moduleTemplateName, toModuleTemplateData(spec));

  return {
    path: toModuleOutputPath(spec),
    content
  };
}
