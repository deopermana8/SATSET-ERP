import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
};

export default function Card({
  title,
  children,
}: Props) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,.05)",
      }}
    >
      {title && (
        <h3
          style={{
            marginTop: 0,
            marginBottom: 20,
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {title}
        </h3>
      )}

      {children}
    </div>
  );
}
