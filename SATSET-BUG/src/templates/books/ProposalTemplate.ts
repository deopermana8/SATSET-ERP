import type { BookTemplate, BookTemplateInput } from "./BookTemplate.js";
import type { BookContext } from "../../generator/BookGenerator.js";

export const ProposalTemplate: BookTemplate = {
  name: "proposal",
  build(input: BookTemplateInput): BookContext {
    return {
      title: input.title,
      subtitle: "Project Proposal",
      author: input.author,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      description: input.description ?? "Formal project proposal.",
      outputDir: input.outputDir,
      chapters: [
        { title: "Executive Summary", content: "One-page summary of the proposal." },
        { title: "Problem Statement", content: "Description of the problem being solved." },
        { title: "Proposed Solution", content: "High-level description of the proposed approach." },
        { title: "Scope of Work", content: "What is included and excluded.", subchapters: [{ title: "In Scope", content: "Deliverables and tasks." }, { title: "Out of Scope", content: "Exclusions." }] },
        { title: "Timeline", content: "Project schedule.", tables: [{ headers: ["Phase", "Start", "End", "Milestone"], rows: [["Phase 1", "Week 1", "Week 4", "Kickoff"], ["Phase 2", "Week 5", "Week 8", "Delivery"]] }] },
        { title: "Budget", content: "Cost breakdown.", tables: [{ headers: ["Item", "Cost"], rows: [["Development", "$10,000"], ["Testing", "$2,000"]] }] },
        { title: "Team", content: "Key personnel and responsibilities." },
        { title: "Risks", content: "Identified risks and mitigation strategies." },
        { title: "Terms and Conditions", content: "Legal and contractual terms." },
      ],
    };
  },
};
