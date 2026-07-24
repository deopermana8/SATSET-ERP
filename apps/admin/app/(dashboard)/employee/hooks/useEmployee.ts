'use client'

import { useCallback, useEffect, useState } from 'react'
import type { EmployeeRow } from '../types'

export function useEmployee() {
  const [rows, setRows] = useState<EmployeeRow[]>([])

  const refresh = useCallback(async () => {
    const response = await fetch('/api/employee')
    if (!response.ok) {
      setRows([])
      return
    }

    const data = (await response.json()) as EmployeeRow[]
    setRows(data)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rows, refresh }
}

