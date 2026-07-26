export default function DashboardChart() {

  const data=[40,65,55,80,72,95,88];

  return (

    <div
      style={{
        background:"#fff",
        border:"1px solid #e5e7eb",
        borderRadius:16,
        padding:24
      }}
    >

      <h2 style={{marginTop:0}}>
        Grafik Pengunjung Mingguan
      </h2>

      <div
        style={{
          display:"flex",
          alignItems:"flex-end",
          gap:16,
          height:220,
          marginTop:20
        }}
      >

        {data.map((v,i)=>(

          <div
            key={i}
            style={{
              flex:1,
              display:"flex",
              flexDirection:"column",
              alignItems:"center"
            }}
          >

            <div
              style={{
                width:"100%",
                height:v*2,
                background:"#2563eb",
                borderRadius:"8px 8px 0 0"
              }}
            />

            <small style={{marginTop:8}}>
              H{i+1}
            </small>

          </div>

        ))}

      </div>

    </div>

  );

}
