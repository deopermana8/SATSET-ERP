export type VisitorValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateVisitor(
  data: Record<string, unknown>
): VisitorValidationResult {
  const errors: Record<string, string> = {};

  if (data.name !== undefined && String(data.name).trim() === "") {
    errors.name = "Nama wajib diisi";
  }

  if (data.email !== undefined && String(data.email).trim() === "") {
    errors.email = "Email tidak valid";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export type CreateVisitorInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  idCard?: string | null;
};

export type UpdateVisitorInput = Partial<CreateVisitorInput>;
