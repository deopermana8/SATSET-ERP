import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { tableTemplateName, toTableOutputPath, toTableTemplateData } from "./tableTemplate.js";

export function generateTable(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Table generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(tableTemplateName, toTableTemplateData(spec));

  return {
    path: toTableOutputPath(spec),
    content
  };
}
