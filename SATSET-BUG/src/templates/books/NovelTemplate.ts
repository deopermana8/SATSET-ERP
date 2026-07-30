import type { BookTemplate, BookTemplateInput } from "./BookTemplate.js";
import type { BookContext } from "../../generator/BookGenerator.js";

export const NovelTemplate: BookTemplate = {
  name: "novel",
  build(input: BookTemplateInput): BookContext {
    return {
      title: input.title,
      author: input.author,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      description: input.description ?? "A work of fiction.",
      outputDir: input.outputDir,
      chapters: [
        { title: "Prologue", content: "Set the scene and hook the reader." },
        { title: "Chapter One", content: "Introduce the protagonist and the inciting incident.", subchapters: [{ title: "Scene 1", content: "Opening scene." }, { title: "Scene 2", content: "Inciting incident." }] },
        { title: "Chapter Two", content: "Rising action — complications begin.", subchapters: [{ title: "Scene 1", content: "Conflict deepens." }] },
        { title: "Chapter Three", content: "The midpoint — a major revelation or turning point." },
        { title: "Chapter Four", content: "Climax — the peak of tension and conflict." },
        { title: "Chapter Five", content: "Resolution — the aftermath and new equilibrium." },
        { title: "Epilogue", content: "Final reflection on the journey." },
      ],
    };
  },
};
