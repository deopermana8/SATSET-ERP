export default function RecentActivity(){

  const rows=[
    ["Reservasi Baru","TK Aisyiyah","5 menit lalu"],
    ["Cafe","Order #1032","12 menit lalu"],
    ["Tiket","45 Pengunjung","18 menit lalu"],
    ["Member","Member Baru","25 menit lalu"],
    ["Souvenir","Transaksi","40 menit lalu"]
  ];

  return(

    <div
      style={{
        background:"#fff",
        border:"1px solid #e5e7eb",
        borderRadius:16,
        padding:24
      }}
    >

      <h2 style={{marginTop:0}}>
        Aktivitas Terbaru
      </h2>

      {rows.map((r,i)=>(

        <div
          key={i}
          style={{
            display:"flex",
            justifyContent:"space-between",
            padding:"14px 0",
            borderBottom:i===rows.length-1?"none":"1px solid #f3f4f6"
          }}
        >

          <div>

            <div style={{fontWeight:600}}>
              {r[0]}
            </div>

            <small style={{color:"#6b7280"}}>
              {r[1]}
            </small>

          </div>

          <small style={{color:"#9ca3af"}}>
            {r[2]}
          </small>

        </div>

      ))}

    </div>

  );

}
