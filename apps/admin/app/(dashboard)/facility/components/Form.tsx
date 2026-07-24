"use client";

import { useState } from "react";

type FacilityFormProps = {
  initialData?: Record<string, unknown>;
  onSubmit?: (data: Record<string, unknown>) => void;
};

export default function Form({
  initialData = {},
  onSubmit,
}: FacilityFormProps) {
  const [data, setData] =
    useState<Record<string, unknown>>(initialData);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">
          Nama
        </label>

        <input
          type="text"
          value={String(data.name ?? "")}
          onChange={(event) =>
            setData({
              ...data,
              name: event.target.value,
            })
          }
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="rounded-md border px-4 py-2"
      >
        Simpan
      </button>
    </form>
  );
}