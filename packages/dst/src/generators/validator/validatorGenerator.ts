import { validateSpec } from "../../parser/index.js";
import { renderTemplateSync } from "../../templates/index.js";
import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import {
  toValidatorOutputPath,
  toValidatorTemplateData,
  validatorTemplateName
} from "./validatorTemplate.js";

export function generateValidator(spec: DstSpecification): GeneratedFile {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Validator generation aborted: invalid specification. ${details}`);
  }

  const content = renderTemplateSync(validatorTemplateName, toValidatorTemplateData(spec));

  return {
    path: toValidatorOutputPath(spec),
    content
  };
}
