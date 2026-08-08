import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { reactQueryTemplateName, toReactQueryOutputPath, toReactQueryTemplateData } from "./reactQueryTemplate.js";

export function generateReactQueryApi(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`React Query API generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(reactQueryTemplateName, toReactQueryTemplateData(spec));

  return {
    path: toReactQueryOutputPath(spec),
    content
  };
}
