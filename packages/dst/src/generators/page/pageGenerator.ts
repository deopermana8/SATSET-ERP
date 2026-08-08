import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { pageTemplateName, toPageOutputPath, toPageTemplateData } from "./pageTemplate.js";

export function generatePage(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Page generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(pageTemplateName, toPageTemplateData(spec));

  return {
    path: toPageOutputPath(spec),
    content
  };
}
