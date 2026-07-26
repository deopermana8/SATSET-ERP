import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface FrontendOutput {
  pages: string[];
  layouts: string[];
  components: string[];
  hooks: string[];
  forms: string[];
  tables: string[];
  dashboard: string[];
  theme: string[];
  responsiveUi: string[];
}

interface ReasoningMetadata {
  screenSpecs?: string[];
  useCases?: string[];
}

export class FrontendGenerator implements IEngine {
  public readonly name = "FrontendGenerator";

  async run(context: Context): Promise<void> {
    const reasoning = this.getReasoning(context);
    const screenName = this.getScreenName(reasoning);
    const pageTitle = this.getPageTitle(screenName);
    const description = reasoning?.useCases?.length ? reasoning.useCases.join(", ") : "Primary workflow";
    const primaryPagePath = path.join(context.projectRoot, "src", "ui", "HomePage.tsx");
    const fallbackPagePath = path.join(context.projectRoot, "src", "app", "(marketing)", "page.tsx");

    const frontend: FrontendOutput = {
      pages: [screenName],
      layouts: ["MainLayout"],
      components: ["Sidebar", "Header"],
      hooks: ["useProjects"],
      forms: ["ProjectForm"],
      tables: ["ProjectTable"],
      dashboard: [screenName],
      theme: ["Shared design tokens"],
      responsiveUi: ["Mobile first layout"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    const pageTemplate = path.join(context.projectRoot, "templates", "screen-page.tsx.tpl");

    await pipeline.run(context, [{
      id: "ui-page",
      name: "ui-page",
      templatePath: pageTemplate,
      outputPath: primaryPagePath,
      variables: {
        PageName: screenName,
        PageTitle: pageTitle,
        Description: description,
      },
    }, {
      id: "ui-page-marketing",
      name: "ui-page-marketing",
      templatePath: pageTemplate,
      outputPath: fallbackPagePath,
      variables: {
        PageName: screenName,
        PageTitle: pageTitle,
        Description: description,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      frontend,
    } as typeof context.metadata & { frontend?: FrontendOutput };
  }

  private getReasoning(context: Context): ReasoningMetadata | null {
    const metadata = context.metadata as Record<string, unknown> | undefined;
    const reasoning = metadata?.reasoning;
    if (reasoning && typeof reasoning === "object") {
      return reasoning as ReasoningMetadata;
    }
    return null;
  }

  private getScreenName(reasoning: ReasoningMetadata | null): string {
    const screen = reasoning?.screenSpecs?.[0]?.trim();
    if (!screen) {
      return "HomePage";
    }
    return screen
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join("");
  }

  private getPageTitle(screenName: string): string {
    return screenName.replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim() || "Home";
  }
}
