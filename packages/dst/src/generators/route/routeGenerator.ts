import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { routeTemplateName, toRouteOutputPath, toRouteTemplateData } from "./routeTemplate.js";

export function generateRoute(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Route generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(routeTemplateName, toRouteTemplateData(spec));

  return {
    path: toRouteOutputPath(spec),
    content
  };
}
