'use client'

import { useCallback, useMemo, useState } from 'react'
import Form from './components/Form'
import Table from './components/Table'
import { useEmployee } from './hooks/useEmployee'
import type { EmployeeFormData } from './types'

export default function Page(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  const { rows, refresh } = useEmployee()
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const handleSubmit = useCallback(
    async (payload: EmployeeFormData) => {
      setError(null)
      try {
        const response = await fetch('/api/employee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
          throw new Error('Gagal menyimpan data karyawan')
        }

        await refresh()
        setPage(1)
      } catch (err){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    },
    [refresh]
  )

  const filteredRows = useMemo(
    () => rows.filter((row) => {
      const term = search.trim().toLowerCase()
      if (!term) return true
      return [row.name, row.email, row.phone, row.role].some((field) => field.toLowerCase().includes(term))
    }),
    [rows, search]
  )

  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 16 }}>Employee</h1>
      {error ? (
        <div style={{ marginBottom: 20, padding: 12, background: '#fee2e2', color: '#b91c1c', borderRadius: 8 }}>
          {error}
        </div>
      ) : null}
      <div style={{ marginBottom: 20 }}>
        <Form onSubmit={handleSubmit} />
      </div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Cari nama, email, telepon, atau jabatan"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />
      </div>
      <div style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <Table rows={pageRows} />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{`Menampilkan ${pageRows.length} dari ${filteredRows.length} karyawan`}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Sebelumnya
            </button>
            <button disabled={page >= pageCount} onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}>
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

