"use client";

import { useEffect, useState } from "react";
import { Bell, Clock3, UserCircle2 } from "lucide-react";

export default function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header
      style={{
        height: 72,
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 28px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Dashboard
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#6b7280",
            fontSize: 13,
            marginTop: 4,
          }}
        >
          <Clock3 size={15} />
          {time}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Bell
          size={22}
          style={{
            cursor: "pointer",
            color: "#6b7280",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <UserCircle2 size={40} color="#2563eb" />

          <div>
            <div
              style={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Administrator
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              Super Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
