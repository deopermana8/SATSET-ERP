import fs from "node:fs";
import path from "node:path";
import type { DomainModel, DomainEntity, EntityField } from "./DomainModelGenerator.js";

export interface CrudPagesGenerateResult {
  written: string[];
  errors: string[];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function displayFields(entity: DomainEntity): EntityField[] {
  return entity.fields.filter((f) => !f.primaryKey && f.name !== "createdAt" && f.name !== "updatedAt");
}

function tablePage(entity: DomainEntity): string {
  const fields = displayFields(entity);
  const headers = fields.map((f) => `        <th>${f.name}</th>`).join("\n");
  const cells = fields.map((f) => `          <td>{String(row["${f.name}"] ?? "")}</td>`).join("\n");

  return `import { useState, useEffect } from "react";

type Row = Record<string, unknown>;

export default function ${cap(entity.name)}Table() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/${entity.name}s")
      .then((r) => r.json())
      .then((d: { data?: Row[] }) => setRows(d.data ?? []));
  }, []);

  return (
    <div>
      <h2>${cap(entity.name)} List</h2>
      <a href="/${entity.name}/new">+ New</a>
      <table>
        <thead>
          <tr>
${headers}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)}>
${cells}
              <td>
                <a href={\`/${entity.name}/\${String(row.id)}\`}>View</a>
                {" | "}
                <a href={\`/${entity.name}/\${String(row.id)}/edit\`}>Edit</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

function formPage(entity: DomainEntity): string {
  const fields = displayFields(entity);
  const inputs = fields
    .map((f) => `      <div>\n        <label>${f.name}</label>\n        <input name="${f.name}" defaultValue={String(data?.["${f.name}"] ?? "")} />\n      </div>`)
    .join("\n");

  return `import { useEffect, useState } from "react";

type Row = Record<string, unknown>;

export default function ${cap(entity.name)}Form({ id }: { id?: string }) {
  const [data, setData] = useState<Row | null>(null);

  useEffect(() => {
    if (id) {
      fetch(\`/api/${entity.name}s/\${id}\`)
        .then((r) => r.json())
        .then((d: Row) => setData(d));
    }
  }, [id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    const url = id ? \`/api/${entity.name}s/\${id}\` : "/api/${entity.name}s";
    const method = id ? "PUT" : "POST";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{id ? "Edit" : "New"} ${cap(entity.name)}</h2>
${inputs}
      <button type="submit">Save</button>
    </form>
  );
}
`;
}

function detailPage(entity: DomainEntity): string {
  const fields = displayFields(entity);
  const rows = fields
    .map((f) => `        <tr><td><strong>${f.name}</strong></td><td>{String(data?.["${f.name}"] ?? "")}</td></tr>`)
    .join("\n");

  return `import { useEffect, useState } from "react";

type Row = Record<string, unknown>;

export default function ${cap(entity.name)}Detail({ id }: { id: string }) {
  const [data, setData] = useState<Row | null>(null);

  useEffect(() => {
    fetch(\`/api/${entity.name}s/\${id}\`)
      .then((r) => r.json())
      .then((d: Row) => setData(d));
  }, [id]);

  return (
    <div>
      <h2>${cap(entity.name)} Detail</h2>
      <table>
        <tbody>
${rows}
        </tbody>
      </table>
      <a href="/${entity.name}">Back</a>
    </div>
  );
}
`;
}

export class CrudPageGenerator {
  generate(model: DomainModel, outputDir: string): CrudPagesGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const pagesDir = path.join(outputDir, "src", "pages");
    try {
      fs.mkdirSync(pagesDir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create pages dir: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    for (const entity of model.entities) {
      const files: Record<string, string> = {
        [`src/pages/${cap(entity.name)}Table.tsx`]: tablePage(entity),
        [`src/pages/${cap(entity.name)}Form.tsx`]: formPage(entity),
        [`src/pages/${cap(entity.name)}Detail.tsx`]: detailPage(entity),
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
    }

    return { written, errors };
  }
}
