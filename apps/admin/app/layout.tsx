import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'SATSET ERP',
  description: 'SATSET ERP foundation application'
}

export default function RootLayout(
{ children }: { children: ReactNode }){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
