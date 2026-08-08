import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { barrelTemplateName, toBarrelTargets, toBarrelTemplateData } from "./barrelTemplate.js";

export function generateBarrel(spec: DstSpecification): GeneratedFile[] {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Barrel generation aborted: invalid specification. ${details}`);
  }

  const targets = toBarrelTargets(spec);
  return targets.map((target) => ({
    path: target.path,
    content: renderTemplateSync(barrelTemplateName, toBarrelTemplateData(target))
  }));
}
