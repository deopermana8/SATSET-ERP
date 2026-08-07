export interface ValidationResult {
  errors: string[];
  ok: boolean;
}

const PASSWORD_COMPLEXITY = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function validateLoginPayload(payload: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  if (!payload.password || typeof payload.password !== "string") {
    errors.push("password is required");
  }

  const hasCredential = typeof payload.email === "string" || typeof payload.username === "string" || typeof payload.phone === "string";
  if (!hasCredential) {
    errors.push("email, username, or phone is required");
  }

  return {
    errors,
    ok: errors.length === 0
  };
}

export function validatePasswordStrength(password: string): ValidationResult {
  const errors: string[] = [];
  if (!PASSWORD_COMPLEXITY.test(password)) {
    errors.push("password must satisfy complexity policy");
  }

  return {
    errors,
    ok: errors.length === 0
  };
}
