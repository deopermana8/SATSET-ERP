export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePluginManifest(raw: Record<string, unknown>): ManifestValidationResult {
  const errors: string[] = [];

  const required: Array<{ field: string; type: "string" }> = [
    { field: "id", type: "string" },
    { field: "name", type: "string" },
    { field: "version", type: "string" },
    { field: "author", type: "string" },
    { field: "engineVersion", type: "string" },
    { field: "main", type: "string" },
  ];

  for (const { field, type } of required) {
    const value = raw[field];
    if (value === undefined || value === null || value === "") {
      errors.push(`missing required field: "${field}"`);
    } else if (typeof value !== type) {
      errors.push(`field "${field}" must be a ${type}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
