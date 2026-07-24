import type { EmployeeRow } from '../types'

export async function getAll(): Promise<EmployeeRow[]> {
  const response = await fetch('/api/employee')
  if (!response.ok) {
    throw new Error('Failed to load employees')
  }
  return response.json()
}

