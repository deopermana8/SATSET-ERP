import type { BookTemplate, BookTemplateInput } from "./BookTemplate.js";
import type { BookContext } from "../../generator/BookGenerator.js";

export const ManualTemplate: BookTemplate = {
  name: "manual",
  build(input: BookTemplateInput): BookContext {
    return {
      title: input.title,
      subtitle: "User Manual",
      author: input.author,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      description: input.description ?? "Step-by-step user manual.",
      outputDir: input.outputDir,
      chapters: [
        { title: "Safety Information", content: "Important safety notices before use." },
        { title: "Product Overview", content: "Components, specifications, and features.", images: [{ alt: "Product overview diagram", src: "images/overview.png", caption: "Figure 1 — Product overview" }] },
        { title: "Installation", content: "Step-by-step installation guide.", subchapters: [{ title: "Requirements", content: "Hardware and software requirements." }, { title: "Installation Steps", content: "Follow these steps in order." }] },
        { title: "Operation", content: "How to use the product day-to-day.", subchapters: [{ title: "Basic Operation", content: "Normal usage." }, { title: "Advanced Features", content: "Power-user features." }] },
        { title: "Maintenance", content: "Routine maintenance and care." },
        { title: "Troubleshooting", content: "Diagnose and resolve common issues.", tables: [{ headers: ["Symptom", "Cause", "Solution"], rows: [["Does not start", "No power", "Check power supply"]] }] },
      ],
      appendix: [
        { title: "Technical Specifications", content: "Full technical specification table." },
        { title: "Warranty", content: "Warranty terms and conditions." },
      ],
    };
  },
};
