import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { formTemplateName, toFormOutputPath, toFormTemplateData } from "./formTemplate.js";

export function generateForm(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Form generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(formTemplateName, toFormTemplateData(spec));

  return {
    path: toFormOutputPath(spec),
    content
  };
}
