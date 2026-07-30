import type { BookTemplate, BookTemplateInput } from "./BookTemplate.js";
import type { BookContext } from "../../generator/BookGenerator.js";

export const DocumentationTemplate: BookTemplate = {
  name: "documentation",
  build(input: BookTemplateInput): BookContext {
    return {
      title: input.title,
      subtitle: "Official Documentation",
      author: input.author,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      description: input.description ?? "Official project documentation.",
      outputDir: input.outputDir,
      chapters: [
        { title: "Overview", content: "What this project does and why it exists." },
        { title: "Getting Started", content: "Prerequisites and quick-start steps.", codeBlocks: [{ language: "bash", code: "npm install\nnpm run dev", caption: "Installation" }] },
        { title: "Configuration", content: "All available configuration options.", tables: [{ headers: ["Option", "Type", "Default", "Description"], rows: [["port", "number", "3000", "Server port"]] }] },
        { title: "API Reference", content: "Complete API endpoint reference.", subchapters: [{ title: "Endpoints", content: "List of all endpoints." }, { title: "Request / Response", content: "Payload formats." }] },
        { title: "Examples", content: "Common usage patterns.", codeBlocks: [{ language: "typescript", code: 'import { Client } from "./client";\nconst client = new Client();', caption: "Basic Usage" }] },
        { title: "Troubleshooting", content: "Common issues and resolutions." },
      ],
      appendix: [
        { title: "Changelog", content: "Version history." },
        { title: "Glossary", content: "Key terms and definitions." },
      ],
    };
  },
};
