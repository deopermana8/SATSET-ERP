import fs from "node:fs";
import path from "node:path";
import type { DomainModel } from "./DomainModelGenerator.js";
import { ResponsiveDashboardGenerator } from "./ResponsiveDashboardGenerator.js";

export interface FullDashboardGenerateResult {
  written: string[];
  errors: string[];
}

const CHARTS = `// Chart placeholders — swap with recharts/chart.js as needed
export function BarChart({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ background: "var(--card-bg, #fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h4 style={{ margin: "0 0 1rem", fontSize: 14, color: "var(--text-muted, #64748b)" }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", background: "#3b82f6", borderRadius: 2, height: \`\${(d.value / max) * 64}px\`, minHeight: 4 }} />
            <span style={{ fontSize: 10, color: "var(--text-muted, #64748b)" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ title, values }: { title: string; values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => \`\${(i / (values.length - 1)) * 200},\${60 - (v / max) * 56}\`)
    .join(" ");
  return (
    <div style={{ background: "var(--card-bg, #fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h4 style={{ margin: "0 0 0.75rem", fontSize: 14, color: "var(--text-muted, #64748b)" }}>{title}</h4>
      <svg width="100%" viewBox="0 0 200 60" preserveAspectRatio="none" style={{ height: 80 }}>
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
      </svg>
    </div>
  );
}
`;

function recentActivity(modules: string[]): string {
  const items = modules
    .slice(0, 5)
    .map((m) => `  { action: "New ${m} added", time: "just now" },`)
    .join("\n");

  return `import { useState } from "react";

interface ActivityItem {
  action: string;
  time: string;
}

const MOCK: ActivityItem[] = [
${items}
];

export default function RecentActivity() {
  const [items] = useState<ActivityItem[]>(MOCK);
  return (
    <div style={{ background: "var(--card-bg, #fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h4 style={{ margin: "0 0 1rem", fontSize: 14, color: "var(--text-muted, #64748b)" }}>Recent Activity</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid var(--border, #f1f5f9)", fontSize: 13 }}>
            <span>{item.action}</span>
            <span style={{ color: "var(--text-muted, #94a3b8)" }}>{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
}

const DARK_MODE_CSS = `:root {
  --bg: #f1f5f9;
  --card-bg: #ffffff;
  --text: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --sidebar-bg: #0f172a;
  --navbar-bg: #1e293b;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --card-bg: #1e293b;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --border: #334155;
    --sidebar-bg: #020617;
    --navbar-bg: #0f172a;
  }
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
  margin: 0;
}
`;

function statisticsWidget(modules: string[]): string {
  const stats = modules
    .map((m, i) => `  { label: "${m}", value: ${(i + 1) * 7}, change: "+${i + 2}%" },`)
    .join("\n");

  return `interface Stat {
  label: string;
  value: number;
  change: string;
}

const STATS: Stat[] = [
${stats}
];

export default function StatisticsWidget() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
      {STATS.map((s) => (
        <div key={s.label} style={{ background: "var(--card-bg, #fff)", borderRadius: 8, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted, #64748b)" }}>{s.label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, margin: "0.25rem 0" }}>{s.value}</div>
          <div style={{ fontSize: 12, color: "#22c55e" }}>{s.change}</div>
        </div>
      ))}
    </div>
  );
}
`;
}

function fullDashboardPage(modules: string[]): string {
  return `import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StatisticsWidget from "./StatisticsWidget";
import RecentActivity from "./RecentActivity";
import { BarChart, LineChart } from "./Charts";
import { useState } from "react";

export default function FullDashboardLayout({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #f1f5f9)" }}>
      <Navbar onMenuToggle={() => setOpen((v) => !v)} />
      <div style={{ display: "flex" }}>
        <Sidebar open={open} />
        <main style={{ flex: 1, padding: "1.5rem", minWidth: 0 }}>
          <StatisticsWidget />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <BarChart title="Activity" data={[${modules.slice(0, 4).map((m, i) => `{ label: "${m}", value: ${(i + 1) * 12} }`).join(", ")}]} />
            <LineChart title="Trend" values={[4, 8, 6, 12, 9, 15, 11]} />
          </div>
          <RecentActivity />
          {children}
        </main>
      </div>
    </div>
  );
}
`;
}

export class FullDashboardGenerator {
  generate(model: DomainModel, outputDir: string): FullDashboardGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    // Reuse base responsive dashboard
    const base = new ResponsiveDashboardGenerator();
    const baseResult = base.generate(model, outputDir);
    written.push(...baseResult.written);
    errors.push(...baseResult.errors);

    const modules = model.entities.map((e) => e.name);
    const componentsDir = path.join(outputDir, "src", "components");
    const stylesDir = path.join(outputDir, "src", "styles");

    for (const dir of [componentsDir, stylesDir]) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch { /* exists */ }
    }

    const files: Record<string, string> = {
      "src/components/Charts.tsx": CHARTS,
      "src/components/RecentActivity.tsx": recentActivity(modules),
      "src/components/StatisticsWidget.tsx": statisticsWidget(modules),
      "src/components/FullDashboardLayout.tsx": fullDashboardPage(modules),
      "src/styles/global.css": DARK_MODE_CSS,
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
