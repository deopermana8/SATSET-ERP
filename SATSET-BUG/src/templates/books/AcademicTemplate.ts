import type { BookTemplate, BookTemplateInput } from "./BookTemplate.js";
import type { BookContext } from "../../generator/BookGenerator.js";

export const AcademicTemplate: BookTemplate = {
  name: "academic",
  build(input: BookTemplateInput): BookContext {
    return {
      title: input.title,
      subtitle: "A Research Study",
      author: input.author,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      description: input.description ?? "Academic research paper.",
      outputDir: input.outputDir,
      chapters: [
        { title: "Abstract", content: "Provide a concise summary of the research, methodology, and findings." },
        { title: "Introduction", content: "State the research problem, objectives, and significance of the study." },
        { title: "Literature Review", content: "Summarize existing research relevant to the topic." },
        { title: "Methodology", content: "Describe the research design, data collection, and analysis methods." },
        { title: "Results", content: "Present findings with supporting data.", tables: [{ headers: ["Variable", "Value", "Significance"], rows: [["Example", "0.05", "p < 0.05"]] }] },
        { title: "Discussion", content: "Interpret findings in the context of existing literature." },
        { title: "Conclusion", content: "Summarize key findings, limitations, and future research directions." },
      ],
      references: [
        { id: "REF001", title: "Example Reference", author: "Author Name", year: 2024 },
      ],
    };
  },
};
