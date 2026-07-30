import fs from "node:fs";
import path from "node:path";

export interface AssetPipelineOptions {
  /** Template assets source directory. Defaults to <cwd>/templates/assets */
  sourceDir?: string;
}

export interface AssetPipelineResult {
  copied: string[];
  created: string[];
  errors: string[];
}

const ASSET_DIRS = ["public", "assets", "images", "icons", "fonts", "logos"] as const;

export class AssetPipeline {
  private readonly sourceDir: string;

  constructor(opts: AssetPipelineOptions = {}) {
    this.sourceDir = opts.sourceDir ?? path.join(process.cwd(), "templates", "assets");
  }

  /** Create standard asset directory structure in outputDir. */
  scaffold(outputDir: string): AssetPipelineResult {
    const created: string[] = [];
    const errors: string[] = [];

    for (const dir of ASSET_DIRS) {
      const target = path.join(outputDir, "public", dir === "public" ? "" : dir).replace(/[/\\]$/, "");
      try {
        fs.mkdirSync(target, { recursive: true });
        created.push(target);
      } catch (err) {
        errors.push(`scaffold ${dir}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Create a minimal public/index.html placeholder
    const indexPath = path.join(outputDir, "public", "index.html");
    if (!fs.existsSync(indexPath)) {
      try {
        fs.writeFileSync(indexPath, "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body></body></html>", "utf8");
        created.push(indexPath);
      } catch (err) {
        errors.push(`index.html: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { copied: [], created, errors };
  }

  /** Copy asset templates from sourceDir into outputDir/public. */
  copyTemplates(outputDir: string): AssetPipelineResult {
    const copied: string[] = [];
    const errors: string[] = [];

    if (!fs.existsSync(this.sourceDir)) {
      return { copied, created: [], errors };
    }

    const copyDir = (src: string, dest: string): void => {
      fs.mkdirSync(dest, { recursive: true });
      for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyDir(s, d);
        } else {
          try {
            fs.copyFileSync(s, d);
            copied.push(d);
          } catch (err) {
            errors.push(`copy ${entry.name}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
    };

    try {
      copyDir(this.sourceDir, path.join(outputDir, "public"));
    } catch (err) {
      errors.push(`copyTemplates: ${err instanceof Error ? err.message : String(err)}`);
    }

    return { copied, created: [], errors };
  }

  /** Scaffold + copy templates. */
  run(outputDir: string): AssetPipelineResult {
    const scaffold = this.scaffold(outputDir);
    const copy = this.copyTemplates(outputDir);
    return {
      copied: [...scaffold.copied, ...copy.copied],
      created: [...scaffold.created, ...copy.created],
      errors: [...scaffold.errors, ...copy.errors],
    };
  }
}
