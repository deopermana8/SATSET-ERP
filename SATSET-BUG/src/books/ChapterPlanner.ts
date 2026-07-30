import type { BookOutline, OutlineChapter } from "./OutlineGenerator.js";

export interface SectionPlan {
  title: string;
  estimatedPages: number;
  estimatedWords: number;
  dependsOn: string[];
}

export interface ChapterPlan {
  index: number;
  title: string;
  estimatedPages: number;
  estimatedWords: number;
  sections: SectionPlan[];
  dependencies: string[];
}

export interface BookPlan {
  totalChapters: number;
  totalEstimatedPages: number;
  totalEstimatedWords: number;
  chapters: ChapterPlan[];
}

const WORDS_PER_PAGE = 300;
const BASE_SECTION_PAGES = 2;
const BASE_SECTION_WORDS = BASE_SECTION_PAGES * WORDS_PER_PAGE;

function planSection(title: string, chapterIndex: number, sectionIndex: number, prevSections: string[]): SectionPlan {
  // Rule: first section has no deps; later sections depend on the previous
  const dependsOn = sectionIndex > 0 ? [prevSections[sectionIndex - 1] ?? ""] : [];
  return {
    title,
    estimatedPages: BASE_SECTION_PAGES,
    estimatedWords: BASE_SECTION_WORDS,
    dependsOn: dependsOn.filter(Boolean),
  };
}

function planChapter(chapter: OutlineChapter, index: number, prevChapter?: ChapterPlan): ChapterPlan {
  const sectionTitles = chapter.subchapters.map((s) => s.title);
  const sections: SectionPlan[] = sectionTitles.map((title, i) =>
    planSection(title, index, i, sectionTitles)
  );

  // Introduction and conclusion have fixed sizes; body chapters scale with sections
  const basePagesForChapter = Math.max(sections.length * BASE_SECTION_PAGES, 4);
  const totalPages = basePagesForChapter;
  const totalWords = totalPages * WORDS_PER_PAGE;

  // Dependency: each chapter depends on the previous one (except the first)
  const dependencies = prevChapter ? [prevChapter.title] : [];

  return {
    index,
    title: chapter.title,
    estimatedPages: totalPages,
    estimatedWords: totalWords,
    sections,
    dependencies,
  };
}

export class ChapterPlanner {
  plan(outline: BookOutline): BookPlan {
    const chapters: ChapterPlan[] = [];

    for (let i = 0; i < outline.chapters.length; i++) {
      const ch = outline.chapters[i]!;
      const prev = chapters[i - 1];
      chapters.push(planChapter(ch, i + 1, prev));
    }

    const totalEstimatedPages = chapters.reduce((sum, ch) => sum + ch.estimatedPages, 0);
    const totalEstimatedWords = chapters.reduce((sum, ch) => sum + ch.estimatedWords, 0);

    return {
      totalChapters: chapters.length,
      totalEstimatedPages,
      totalEstimatedWords,
      chapters,
    };
  }
}
