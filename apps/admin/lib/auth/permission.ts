export type SessionUser = {
  role?: string
  permissions?: string[]
}

export function hasRole(
  user: SessionUser | null | undefined,
  role: string
) {
  return user?.role === role
}

export function hasPermission(
  user: SessionUser | null | undefined,
  permission: string
) {
  if (!user) return false

  if (user.role === "SUPER_ADMIN") return true

  return (user.permissions ?? []).includes(permission)
}

export function canAccess(
  user: SessionUser | null |undefined,
  permissions: string[]
) {
  if (!user) return false

  if (user.role === "SUPER_ADMIN") return true

  return permissions.every(p =>
    (user.permissions ?? []).includes(p)
  )
}
