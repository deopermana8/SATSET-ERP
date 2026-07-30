import fs from "node:fs";
import path from "node:path";
import type { DomainModel } from "./DomainModelGenerator.js";

export interface ResponsiveDashboardGenerateResult {
  written: string[];
  errors: string[];
}

const NAVBAR = `export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.5rem", height: 56, background: "#1e293b", color: "#f8fafc",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <button
        onClick={onMenuToggle}
        style={{ background: "none", border: "none", color: "#f8fafc", cursor: "pointer", fontSize: 20 }}
        aria-label="toggle menu"
      >☰</button>
      <span style={{ fontWeight: 700, fontSize: 18 }}>Dashboard</span>
      <span style={{ fontSize: 13 }}>Admin</span>
    </nav>
  );
}
`;

function sidebar(modules: string[]): string {
  const links = modules
    .map((m) => `      <li>
        <a href="/${m}" style={{ color: "#cbd5e1", textDecoration: "none", display: "block", padding: "0.5rem 1rem", borderRadius: 4 }}>
          ${m.charAt(0).toUpperCase() + m.slice(1)}
        </a>
      </li>`)
    .join("\n");

  return `export default function Sidebar({ open }: { open: boolean }) {
  return (
    <aside style={{
      width: open ? 220 : 0, overflow: "hidden", transition: "width 0.2s",
      background: "#0f172a", color: "#cbd5e1", flexShrink: 0,
      height: "calc(100vh - 56px)", position: "sticky", top: 56,
    }}>
      <ul style={{ listStyle: "none", padding: "1rem 0", margin: 0 }}>
${links}
      </ul>
    </aside>
  );
}
`;
}

function statCards(modules: string[]): string {
  const cards = modules
    .map((m) => `      <div style={{
        background: "#fff", borderRadius: 8, padding: "1.25rem 1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", minWidth: 160,
      }}>
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
          ${m.charAt(0).toUpperCase() + m.slice(1)}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>—</div>
      </div>`)
    .join("\n");

  return `export default function StatCards() {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem",
    }}>
${cards}
    </div>
  );
}
`;
}

function dashboardLayout(modules: string[]): string {
  return `import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StatCards from "./StatCards";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      <Navbar onMenuToggle={() => setOpen((v) => !v)} />
      <div style={{ display: "flex" }}>
        <Sidebar open={open} />
        <main style={{ flex: 1, padding: "1.5rem", minWidth: 0 }}>
          <StatCards />
          {children}
        </main>
      </div>
    </div>
  );
}
`;
}

export class ResponsiveDashboardGenerator {
  generate(model: DomainModel, outputDir: string): ResponsiveDashboardGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const dir = path.join(outputDir, "src", "components");
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create ${dir}: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    const modules = model.entities.map((e) => e.name);

    const files: Record<string, string> = {
      "src/components/Navbar.tsx": NAVBAR,
      "src/components/Sidebar.tsx": sidebar(modules),
      "src/components/StatCards.tsx": statCards(modules),
      "src/components/DashboardLayout.tsx": dashboardLayout(modules),
    };

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
