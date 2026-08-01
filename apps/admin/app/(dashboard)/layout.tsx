import type { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

export default function DashboardLayout(
{
  children,
}: {
  children: ReactNode;
}){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <main
          style={{
            flex: 1,
            padding: 32,
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
