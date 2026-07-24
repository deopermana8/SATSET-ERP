"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  ["Dashboard","/dashboard","🏠"],
  ["Tiket","/ticket","🎫"],
  ["Reservasi","/reservation","📅"],
  ["Cafe","/cafe","☕"],
  ["Souvenir","/souvenir","🛍️"],
  ["Outbound","/outbound","🌳"],
  ["Member","/member","👥"],
  ["Gudang","/warehouse","📦"],
  ["Keuangan","/finance","💰"],
  ["Laporan","/report","📊"],
  ["Setting","/setting","⚙️"]
];

export default function Sidebar(){

  const pathname=usePathname();

  return(

    <aside
      style={{
        width:260,
        background:"#111827",
        color:"#fff",
        display:"flex",
        flexDirection:"column",
        minHeight:"100vh"
      }}
    >

      <div
        style={{
          padding:24,
          borderBottom:"1px solid rgba(255,255,255,.08)"
        }}
      >

        <h2 style={{margin:0}}>
          SATSET ERP
        </h2>

        <small style={{color:"#9ca3af"}}>
          Wisata Lontar Sewu
        </small>

      </div>

      <nav style={{padding:16}}>

        {menus.map(([title,href,icon])=>(

          <Link
            key={href}
            href={href}
            style={{
              display:"flex",
              alignItems:"center",
              gap:12,
              padding:"14px 16px",
              marginBottom:8,
              borderRadius:12,
              textDecoration:"none",
              color:"#fff",
              background:
                pathname===href
                  ? "#2563eb"
                  : "transparent"
            }}
          >

            <span>{icon}</span>

            <span>{title}</span>

          </Link>

        ))}

      </nav>

    </aside>

  );

}
