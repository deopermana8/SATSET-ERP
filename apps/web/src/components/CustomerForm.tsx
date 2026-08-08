import React from "react";
import type { CreateCustomerDto, CustomerItem, UpdateCustomerDto } from "../dto/CustomerDto";
import { useCustomer } from "../hooks/useCustomer";

interface CustomerFormProps {
  selectedCustomer: CustomerItem | null;
  onDoneEditing: () => void;
}

interface FormState {
  code: string;
  fullName: string;
  email: string;
  phone: string;
}

function toFormState(customer: CustomerItem | null): FormState {
  if (!customer) {
    return {
      code: "",
      fullName: "",
      email: "",
      phone: ""
    };
  }

  return {
    code: customer.code,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone ?? ""
  };
}

export function CustomerForm({ selectedCustomer, onDoneEditing }: CustomerFormProps) {
  const { createMutation, updateMutation } = useCustomer();
  const [form, setForm] = React.useState<FormState>(() => toFormState(selectedCustomer));
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  React.useEffect(() => {
    setForm(toFormState(selectedCustomer));
    setSuccessMessage("");
  }, [selectedCustomer]);

  const validationErrors = React.useMemo(() => {
    const errors: string[] = [];

    if (!form.code.trim()) {
      errors.push("Code wajib diisi");
    }
    if (!form.fullName.trim()) {
      errors.push("Nama lengkap wajib diisi");
    }
    if (!form.email.trim()) {
      errors.push("Email wajib diisi");
    }

    return errors;
  }, [form]);

  const isEditing = Boolean(selectedCustomer);
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  const payload: CreateCustomerDto = {
    code: form.code.trim(),
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined
  };

  const onSubmit = async (): Promise<void> => {
    if (validationErrors.length > 0) {
      return;
    }

    setSuccessMessage("");
    if (!isEditing) {
      await createMutation.mutateAsync(payload);
      setSuccessMessage("Customer berhasil dibuat");
      setForm(toFormState(null));
      return;
    }

    const updatePayload: UpdateCustomerDto = {
      code: payload.code,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone
    };
    await updateMutation.mutateAsync({
      id: selectedCustomer!.id,
      payload: updatePayload
    });
    setSuccessMessage("Customer berhasil diperbarui");
    onDoneEditing();
  };

  const onChange = (key: keyof FormState, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section>
      <h2>{isEditing ? "Ubah Customer" : "Tambah Customer"}</h2>

      <div>
        <label>
          Kode
          <input
            value={form.code}
            onChange={(event) => onChange("code", event.target.value)}
            disabled={isLoading}
          />
        </label>
      </div>

      <div>
        <label>
          Nama Lengkap
          <input
            value={form.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            disabled={isLoading}
          />
        </label>
      </div>

      <div>
        <label>
          Email
          <input
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            disabled={isLoading}
          />
        </label>
      </div>

      <div>
        <label>
          Telepon
          <input
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            disabled={isLoading}
          />
        </label>
      </div>

      {validationErrors.length > 0 ? (
        <p>{validationErrors[0]}</p>
      ) : null}

      {error ? (
        <p>{error instanceof Error ? error.message : "Terjadi kesalahan"}</p>
      ) : null}

      {successMessage ? <p>{successMessage}</p> : null}

      <button type="button" onClick={() => void onSubmit()} disabled={isLoading || validationErrors.length > 0}>
        {isLoading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Customer"}
      </button>

      {isEditing ? (
        <button type="button" onClick={onDoneEditing} disabled={isLoading}>
          Batal
        </button>
      ) : null}
    </section>
  );
}
