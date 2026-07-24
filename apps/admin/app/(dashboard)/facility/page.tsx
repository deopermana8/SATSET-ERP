export default function Page() {
  return (
    <div style={{padding:24}}>
      <h1 style={{fontSize:30,fontWeight:"bold"}}>
        facility
      </h1>

      <div style={{
        marginTop:20,
        padding:20,
        background:"#fff",
        borderRadius:12,
        border:"1px solid #e5e7eb"
      }}>
        <button>Tambah Data</button>

        <table style={{width:"100%",marginTop:20}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Contoh</td>
              <td>Edit | Hapus</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

