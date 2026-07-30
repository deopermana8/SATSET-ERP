import type { BookContext } from "../../generator/BookGenerator.js";

export type BookTemplateName = "academic" | "novel" | "documentation" | "manual" | "proposal" | "technical";

export interface BookTemplateInput {
  title: string;
  author: string;
  outputDir: string;
  date?: string;
  description?: string;
}

export interface BookTemplate {
  name: BookTemplateName;
  build(input: BookTemplateInput): BookContext;
}
