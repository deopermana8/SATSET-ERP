import { FormAutosave } from "./FormAutosave.js";
import { FormDraft } from "./FormDraft.js";
import { FormProgress } from "./FormProgress.js";
import { FormToolbar } from "./FormToolbar.js";
import { FormValidation } from "./FormValidation.js";
import { FormWizard } from "./FormWizard.js";

export function Form(): string {
  return `<section id="v-form" aria-label="Entity Form">${FormToolbar()}${FormProgress()}${FormValidation()}${FormAutosave()}${FormDraft()}${FormWizard()}</section>`;
}
