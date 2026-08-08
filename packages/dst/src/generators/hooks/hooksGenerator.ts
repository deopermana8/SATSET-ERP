import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { hooksTemplateName, toHooksOutputPath, toHooksTemplateData } from "./hooksTemplate.js";

export function generateHooks(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Hooks generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(hooksTemplateName, toHooksTemplateData(spec));

  return {
    path: toHooksOutputPath(spec),
    content
  };
}
