import type { PluginManifest } from "./PluginManifest.js";

export interface PluginValidationError {
  field: string;
  message: string;
}

export interface PluginValidationResult {
  valid: boolean;
  errors: PluginValidationError[];
}

const SEMVER_RE = /^\d+\.\d+\.\d+/;

export class PluginValidator {
  private readonly seenIds = new Set<string>();

  validate(manifest: Partial<PluginManifest>): PluginValidationResult {
    const errors: PluginValidationError[] = [];

    if (!manifest.id || typeof manifest.id !== "string" || manifest.id.trim() === "") {
      errors.push({ field: "id", message: "id is required and must be a non-empty string" });
    } else if (this.seenIds.has(manifest.id)) {
      errors.push({ field: "id", message: `duplicate plugin id: "${manifest.id}"` });
    } else {
      this.seenIds.add(manifest.id);
    }

    if (!manifest.version || typeof manifest.version !== "string" || !SEMVER_RE.test(manifest.version)) {
      errors.push({ field: "version", message: "version is required and must follow semver (e.g. 1.0.0)" });
    }

    if (!Array.isArray(manifest.capabilities)) {
      errors.push({ field: "capabilities", message: "capabilities must be an array of strings" });
    } else if (manifest.capabilities.some((c) => typeof c !== "string")) {
      errors.push({ field: "capabilities", message: "every entry in capabilities must be a string" });
    }

    return { valid: errors.length === 0, errors };
  }

  reset(): void {
    this.seenIds.clear();
  }
}
