import fs from "node:fs";
import path from "node:path";
import type { ExecutionPlan } from "../ai/ModulePlanner.js";
import { renderTemplate } from "../template/TemplateEngine.js";
import { templateStore } from "../templates/TemplateStore.js";

function loadTpl(name: string): string {
  return templateStore.get("react", name) ?? "";
}

export interface ReactAppGenerateResult {
  written: string[];
  errors: string[];
}

export class ReactAppGenerator {
  generate(plan: ExecutionPlan, outputDir: string): ReactAppGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const moduleVars = plan.modules.map((m) => ({ name: m.name, cap: capitalize(m.name) }));
    const vars = { modules: moduleVars };

    const appTpl = loadTpl("App.tsx");
    const layoutTpl = loadTpl("Layout.tsx");
    const routerTpl = loadTpl("router.ts");

    const files: Record<string, string> = {
      "src/App.tsx": appTpl
        ? renderTemplate(appTpl, vars, { stripUnresolved: true }).replace(/\n{3,}/g, "\n\n")
        : `import { BrowserRouter, Routes, Route } from "react-router-dom";\nimport Layout from "./Layout";\n${moduleVars.map((m) => `import ${m.cap}Page from "./pages/${m.cap}Page";`).join("\n")}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route element={<Layout />}>\n${moduleVars.map((m) => `  { path: "/${m.name}", element: <${m.cap}Page /> },`).join("\n")}\n        </Route>\n      </Routes>\n    </BrowserRouter>\n  );\n}\n`,
      "src/Layout.tsx": layoutTpl || `import { Outlet } from "react-router-dom";\n\nexport default function Layout() {\n  return (\n    <div>\n      <header><h1>App</h1></header>\n      <main><Outlet /></main>\n    </div>\n  );\n}\n`,
      "src/router.ts": routerTpl
        ? renderTemplate(routerTpl, vars, { stripUnresolved: true })
        : `export const routes = [\n${plan.modules.map((m) => `  { path: "/${m.name}", name: "${m.name}" },`).join("\n")}\n] as const;\n`,
    };

    try {
      fs.mkdirSync(path.join(outputDir, "src", "pages"), { recursive: true });
    } catch (err) {
      errors.push(`failed to create directories: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    for (const [filePath, content] of Object.entries(files)) {
      const target = path.join(outputDir, filePath);
      try {
        fs.writeFileSync(target, content, "utf8");
        written.push(target);
      } catch (err) {
        errors.push(`failed to write ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { written, errors };
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
