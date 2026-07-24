'use client';

import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import { Guest } from "../../domain/entities/guest";
import { Package as ReservationPackage } from "../../domain/entities/package";
import { Schedule } from "../../domain/entities/schedule";
import { GuestCount } from "../../domain/value-objects/guest-count";
import { ReservationId } from "../../domain/value-objects/reservation-id";
import { Reservation } from "../../domain/entities/reservation";

type ReservationPackageOption = {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
};

type ScheduleOption = {
  id: string;
  label: string;
  time: string;
  availability: string;
};

type FormState = {
  guestName: string;
  email: string;
  phone: string;
  packageId: string;
  scheduleId: string;
  guestCount: string;
  notes: string;
};

const inputClassName = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-emerald-500";
const selectClassName = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500";
const labelClassName = "block text-sm font-medium text-slate-700";

const packageOptions: ReservationPackageOption[] = [
  {
    id: "family",
    name: "Family Adventure",
    price: 320000,
    capacity: 8,
    description: "Paket wisata keluarga dengan akses prioritas dan snack gratis.",
  },
  {
    id: "premium",
    name: "Premium Escape",
    price: 480000,
    capacity: 4,
    description: "Paket eksklusif dengan guided tour dan lounge premium.",
  },
  {
    id: "group",
    name: "Group Explorer",
    price: 240000,
    capacity: 12,
    description: "Pilihan hemat untuk rombongan besar dan kegiatan bersama.",
  },
];

const scheduleOptions: ScheduleOption[] = [
  {
    id: "morning",
    label: "Sesi Pagi",
    time: "08.00 - 12.00",
    availability: "Tersedia 6 slot",
  },
  {
    id: "afternoon",
    label: "Sesi Siang",
    time: "12.30 - 16.30",
    availability: "Tersedia 4 slot",
  },
  {
    id: "sunset",
    label: "Sesi Sunset",
    time: "17.00 - 20.00",
    availability: "Tersedia 8 slot",
  },
];

const initialState: FormState = {
  guestName: "",
  email: "",
  phone: "",
  packageId: packageOptions[0].id,
  scheduleId: scheduleOptions[0].id,
  guestCount: "2",
  notes: "",
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className={labelClassName}>
      {label}
      {children}
    </label>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
};

function TextField({ label, value, onChange, type, placeholder, required, min, max }: TextFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Field label={label}>
      <input
        className={inputClassName}
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <Field label={label}>
      <select className={selectClassName} value={value} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextareaField({ label, value, onChange, placeholder }: TextareaFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <Field label={label}>
      <textarea
        className={`${inputClassName} min-h-28`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </Field>
  );
}

export function ReservationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [mockReservation, setMockReservation] = useState<Reservation | null>(null);

  const selectedPackage = packageOptions.find((item) => item.id === form.packageId) ?? packageOptions[0];
  const selectedSchedule = scheduleOptions.find((item) => item.id === form.scheduleId) ?? scheduleOptions[0];

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const guest = new Guest({
      name: form.guestName,
      email: form.email,
      phone: form.phone,
      preferences: { notes: form.notes },
    });

    const reservationPackage = new ReservationPackage({
      code: selectedPackage.id,
      name: selectedPackage.name,
      capacity: selectedPackage.capacity,
      description: selectedPackage.description,
    });

    const schedule = new Schedule({
      start: new Date(`${new Date().toISOString().slice(0, 10)}T08:00:00`),
      end: new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`),
    });

    const guestCount = new GuestCount(Number.parseInt(form.guestCount, 10));
    const reservation = Reservation.createPending({
      reservationId: new ReservationId(`RES-${Date.now()}`),
      guest,
      reservationPackage,
      schedule,
      guestCount,
      notes: form.notes,
    });

    setMockReservation(reservation);
    setSubmitted(true);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Demo Reservasi</p>
        <h2 className="text-2xl font-semibold text-slate-900">Buat reservasi wisata tanpa backend</h2>
        <p className="text-sm text-slate-600">
          Form ini memakai data simulasi untuk menampilkan alur reservasi secara lokal.
        </p>
      </div>

      <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <TextField
            label="Nama tamu"
            value={form.guestName}
            onChange={(value) => handleChange("guestName", value)}
            placeholder="Contoh: Rina Putri"
            required
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={(value) => handleChange("email", value)}
            type="email"
            placeholder="nama@email.com"
            required
          />

          <TextField
            label="Nomor telepon"
            value={form.phone}
            onChange={(value) => handleChange("phone", value)}
            placeholder="08xxxxxxxxxx"
            required
          />

          <TextField
            label="Jumlah tamu"
            value={form.guestCount}
            onChange={(value) => handleChange("guestCount", value)}
            type="number"
            min="1"
            max="12"
            required
          />
        </div>

        <div className="space-y-4">
          <SelectField
            label="Paket wisata"
            value={form.packageId}
            options={packageOptions.map((option) => ({ id: option.id, label: option.name }))}
            onChange={(value) => handleChange("packageId", value)}
          />

          <SelectField
            label="Jadwal"
            value={form.scheduleId}
            options={scheduleOptions.map((option) => ({ id: option.id, label: option.label }))}
            onChange={(value) => handleChange("scheduleId", value)}
          />

          <TextareaField
            label="Catatan tambahan"
            value={form.notes}
            onChange={(value) => handleChange("notes", value)}
            placeholder="Tulis kebutuhan khusus atau permintaan Anda"
          />

          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
            type="submit"
          >
            Simpan reservasi demo
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Ringkasan pilihan</p>
            <p className="text-sm text-slate-600">{selectedPackage.name} • {selectedSchedule.label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">Rp {selectedPackage.price.toLocaleString("id-ID")}</p>
            <p className="text-xs text-slate-500">Kapasitas {selectedPackage.capacity} orang</p>
          </div>
        </div>
        {submitted ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Reservasi demo berhasil dibuat untuk {form.guestName || "tamu"}. Jadwal {selectedSchedule.time} telah dipilih.
            {mockReservation ? ` Status: ${mockReservation.currentStatus.toString()}` : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
