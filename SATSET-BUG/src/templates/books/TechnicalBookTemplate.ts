import type { BookTemplate, BookTemplateInput } from "./BookTemplate.js";
import type { BookContext } from "../../generator/BookGenerator.js";

export const TechnicalBookTemplate: BookTemplate = {
  name: "technical",
  build(input: BookTemplateInput): BookContext {
    return {
      title: input.title,
      subtitle: "A Comprehensive Technical Guide",
      author: input.author,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      description: input.description ?? "In-depth technical reference.",
      outputDir: input.outputDir,
      chapters: [
        { title: "Introduction", content: "What this book covers and how to read it." },
        { title: "Fundamentals", content: "Core concepts you must understand.", subchapters: [{ title: "Key Concepts", content: "Essential terminology." }, { title: "Architecture Overview", content: "High-level design." }] },
        { title: "Core Implementation", content: "Detailed implementation guide.", codeBlocks: [{ language: "typescript", code: "export function example(): void {\n  console.log('Hello');\n}", caption: "Listing 3.1 — Basic example" }] },
        { title: "Advanced Patterns", content: "Design patterns and best practices.", subchapters: [{ title: "Performance Optimization", content: "Techniques to improve speed." }, { title: "Security Hardening", content: "Security considerations." }] },
        { title: "Testing", content: "Testing strategy and examples.", codeBlocks: [{ language: "typescript", code: 'import assert from "node:assert/strict";\nassert.ok(true, "basic test");', caption: "Listing 5.1 — Test example" }] },
        { title: "Deployment", content: "How to deploy to production.", subchapters: [{ title: "Docker", content: "Containerisation." }, { title: "CI/CD", content: "Automated pipeline." }] },
        { title: "Reference", content: "Complete API and configuration reference.", tables: [{ headers: ["Property", "Type", "Default"], rows: [["timeout", "number", "5000"], ["retries", "number", "3"]] }] },
      ],
      appendix: [
        { title: "Glossary", content: "Technical terms and definitions." },
        { title: "Further Reading", content: "Recommended books and resources." },
      ],
      references: [
        { id: "TECH001", title: "Clean Code", author: "Robert C. Martin", year: 2008 },
        { id: "TECH002", title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", year: 2019 },
      ],
    };
  },
};
