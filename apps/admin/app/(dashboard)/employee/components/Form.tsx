'use client'

import { useState, type FormEvent } from 'react'
import { validation } from '../validation'
import type { EmployeeFormData } from '../types'

type EmployeeFormProps = {
  onSubmit?: (value: EmployeeFormData) => void
}

const emptyValue: EmployeeFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'Staff',
}

export default function Form({ onSubmit }: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormData>(emptyValue)
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Partial<Record<keyof EmployeeFormData, string>> = {}

    if (!validation.name(form.name)) {
      nextErrors.name = 'Nama harus diisi minimal 2 karakter'
    }
    if (!validation.email(form.email)) {
      nextErrors.email = 'Email tidak valid'
    }
    if (!validation.phone(form.phone)) {
      nextErrors.phone = 'Telepon harus diisi minimal 8 karakter'
    }
    if (!validation.role(form.role)) {
      nextErrors.role = 'Jabatan harus dipilih'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      onSubmit?.(form)
      setForm(emptyValue)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Nama"
        />
        {errors.name ? <span style={{ color: '#b91c1c' }}>{errors.name}</span> : null}
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <input
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Email"
        />
        {errors.email ? <span style={{ color: '#b91c1c' }}>{errors.email}</span> : null}
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <input
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          placeholder="Telepon"
        />
        {errors.phone ? <span style={{ color: '#b91c1c' }}>{errors.phone}</span> : null}
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="Staff">Staff</option>
          <option value="Manager">Manager</option>
          <option value="Supervisor">Supervisor</option>
        </select>
        {errors.role ? <span style={{ color: '#b91c1c' }}>{errors.role}</span> : null}
      </div>
      <button type="submit">Simpan</button>
    </form>
  )
}

