import StatCard from "../../../components/StatCard";
import DashboardChart from "../../../components/DashboardChart";
import RecentActivity from "../../../components/RecentActivity";

export default function DashboardPage() {
  return (
    <div style={{display:"grid",gap:24}}>

      <div>
        <h1 style={{margin:0,fontSize:34,fontWeight:700}}>
          Dashboard SATSET ERP
        </h1>

        <p style={{color:"#6b7280"}}>
          Selamat datang di pusat kendali Wisata Lontar Sewu.
        </p>
      </div>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",
          gap:20
        }}
      >

        <StatCard
          title="Pengunjung Hari Ini"
          value="125"
          color="#2563eb"
        />

        <StatCard
          title="Reservasi"
          value="42"
          color="#10b981"
        />

        <StatCard
          title="Pendapatan"
          value="Rp 12,4 Jt"
          color="#f59e0b"
        />

        <StatCard
          title="Member"
          value="1.245"
          color="#8b5cf6"
        />

      </div>

      <div
        style={{
          background:"#fff",
          border:"1px solid #e5e7eb",
          borderRadius:16,
          padding:24
        }}
      >
        <h2 style={{marginTop:0}}>
          Aktivitas Hari Ini
        </h2>

        <table style={{width:"100%",borderCollapse:"collapse"}}>

          <tbody>

            <tr>
              <td style={{padding:12}}>Reservasi Baru</td>
              <td>15</td>
            </tr>

            <tr>
              <td style={{padding:12}}>Cafe</td>
              <td>Rp2.350.000</td>
            </tr>

            <tr>
              <td style={{padding:12}}>Souvenir</td>
              <td>Rp870.000</td>
            </tr>

            <tr>
              <td style={{padding:12}}>Tiket Masuk</td>
              <td>125 Orang</td>
            </tr>

          </tbody>

        </table>

      </div>

    
      <DashboardChart />

      <RecentActivity />

    </div>
  );
}


