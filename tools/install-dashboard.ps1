param()

$Root = Resolve-Path "$PSScriptRoot\.."

$Components = Join-Path $Root "apps\admin\components"
$Dashboard  = Join-Path $Root "apps\admin\app\(dashboard)\dashboard"

New-Item -ItemType Directory -Force $Components | Out-Null
New-Item -ItemType Directory -Force $Dashboard | Out-Null

@"
type Props = {
  title: string
  value: string
}

export default function StatCard({ title, value }: Props) {
  return (
    <div style={{
      background:"#fff",
      border:"1px solid #e5e7eb",
      borderRadius:12,
      padding:20,
      boxShadow:"0 2px 8px rgba(0,0,0,.05)"
    }}>
      <div style={{color:"#6b7280"}}>{title}</div>
      <div style={{fontSize:30,fontWeight:"bold",marginTop:10}}>
        {value}
      </div>
    </div>
  )
}
"@ | Set-Content "$Components\StatCard.tsx"

@"
import StatCard from "../../../components/StatCard";

export default function DashboardPage() {
  return (
    <>
      <h1 style={{fontSize:28,fontWeight:"bold",marginBottom:24}}>
        Dashboard SATSET ERP
      </h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
        gap:20
      }}>
        <StatCard title="Pengunjung Hari Ini" value="125" />
        <StatCard title="Pendapatan" value="Rp2.350.000" />
        <StatCard title="Cafe" value="Rp780.000" />
        <StatCard title="Member" value="1.245" />
      </div>
    </>
  )
}
"@ | Set-Content "$Dashboard\page.tsx"

Write-Host ""
Write-Host "===================================="
Write-Host " SATSET Dashboard Installed"
Write-Host "===================================="
