"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { categorySchema, type CategoryFormValues } from "../validation";

type CategoryFormProps = {
  initialData?: Partial<CategoryFormValues>;
  onSubmit?: (data: CategoryFormValues) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
};

export default function Form({
  initialData,
  onSubmit,
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  onCancel,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: initialData?.name ?? "" },
  });

  useEffect(() => {
    reset({ name: initialData?.name ?? "" });
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit?.(data);
      })}
      className="space-y-4"
    >
      <div>
        <label htmlFor="category-name" className="block text-sm font-medium text-slate-700">
          Nama
        </label>
        <input
          id="category-name"
          type="text"
          {...register("name")}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "category-name-error" : undefined}
        />
        {errors.name ? (
          <p id="category-name-error" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-md border border-slate-300 px-4 py-2">
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2">
            {cancelLabel}
          </button>
        ) : null}
      </div>
    </form>
  );
}
