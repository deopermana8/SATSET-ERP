import fs from "node:fs";
import path from "node:path";
import type { ExecutionPlan } from "../ai/ModulePlanner.js";

export interface DashboardGenerateResult {
  written: string[];
  errors: string[];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const NAVBAR = `export default function Navbar() {
  return (
    <nav style={{ padding: "0.75rem 1.5rem", background: "#1e293b", color: "#f8fafc" }}>
      <span style={{ fontWeight: "bold" }}>Dashboard</span>
    </nav>
  );
}
`;

function sidebar(modules: string[]): string {
  const links = modules
    .map((m) => `      <li><a href="/${m}">${capitalize(m)}</a></li>`)
    .join("\n");
  return `export default function Sidebar() {
  return (
    <aside style={{ width: 200, background: "#0f172a", color: "#cbd5e1", padding: "1rem" }}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
${links}
      </ul>
    </aside>
  );
}
`;
}

function crudTable(module: string): string {
  const cap = capitalize(module);
  return `export default function ${cap}Table() {
  return (
    <div>
      <h2>${cap}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* rows */}
        </tbody>
      </table>
    </div>
  );
}
`;
}

function dashboardPage(modules: string[]): string {
  const imports = modules
    .map((m) => `import ${capitalize(m)}Table from "../components/${capitalize(m)}Table";`)
    .join("\n");
  const tables = modules
    .map((m) => `      <${capitalize(m)}Table />`)
    .join("\n");
  return `import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
${imports}

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "1.5rem" }}>
${tables}
        </main>
      </div>
    </div>
  );
}
`;
}

export class DashboardGenerator {
  generate(plan: ExecutionPlan, outputDir: string): DashboardGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const modules = plan.modules
      .filter((m) => !["auth", "database", "notification"].includes(m.name))
      .map((m) => m.name);

    const dirs = [
      path.join(outputDir, "src", "components"),
      path.join(outputDir, "src", "pages"),
    ];

    for (const dir of dirs) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        errors.push(`failed to create ${dir}: ${err instanceof Error ? err.message : String(err)}`);
        return { written, errors };
      }
    }

    const files: Record<string, string> = {
      "src/components/Navbar.tsx": NAVBAR,
      "src/components/Sidebar.tsx": sidebar(modules),
      "src/pages/DashboardPage.tsx": dashboardPage(modules),
    };

    for (const module of modules) {
      files[`src/components/${capitalize(module)}Table.tsx`] = crudTable(module);
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
