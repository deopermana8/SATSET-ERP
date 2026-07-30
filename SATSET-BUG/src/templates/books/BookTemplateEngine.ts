import type { BookTemplate, BookTemplateName, BookTemplateInput } from "./BookTemplate.js";
import type { BookContext } from "../../generator/BookGenerator.js";
import { AcademicTemplate } from "./AcademicTemplate.js";
import { NovelTemplate } from "./NovelTemplate.js";
import { DocumentationTemplate } from "./DocumentationTemplate.js";
import { ManualTemplate } from "./ManualTemplate.js";
import { ProposalTemplate } from "./ProposalTemplate.js";
import { TechnicalBookTemplate } from "./TechnicalBookTemplate.js";

export { AcademicTemplate, NovelTemplate, DocumentationTemplate, ManualTemplate, ProposalTemplate, TechnicalBookTemplate };
export type { BookTemplate, BookTemplateName, BookTemplateInput };

const TEMPLATES: Record<BookTemplateName, BookTemplate> = {
  academic: AcademicTemplate,
  novel: NovelTemplate,
  documentation: DocumentationTemplate,
  manual: ManualTemplate,
  proposal: ProposalTemplate,
  technical: TechnicalBookTemplate,
};

export class BookTemplateEngine {
  getTemplate(name: BookTemplateName): BookTemplate {
    const tmpl = TEMPLATES[name];
    if (!tmpl) throw new Error(`Unknown book template: ${name}`);
    return tmpl;
  }

  build(name: BookTemplateName, input: BookTemplateInput): BookContext {
    return this.getTemplate(name).build(input);
  }

  listTemplates(): BookTemplateName[] {
    return Object.keys(TEMPLATES) as BookTemplateName[];
  }
}
