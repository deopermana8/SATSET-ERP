type EmployeeRow = {
  id: number
  name: string
  email: string
  phone: string
  role: string
}

type TableProps = {
  rows: EmployeeRow[]
}

export default function Table(
{ rows }: TableProps){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Nama</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Telepon</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Jabatan</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{ padding: 8 }}>{row.id}</td>
            <td style={{ padding: 8 }}>{row.name}</td>
            <td style={{ padding: 8 }}>{row.email}</td>
            <td style={{ padding: 8 }}>{row.phone}</td>
            <td style={{ padding: 8 }}>{row.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}


