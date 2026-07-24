type Props = {
  title: string;
  value: string;
  color?: string;
};

export default function StatCard({
  title,
  value,
  color = "#2563eb",
}: Props) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,.06)",
        transition: "all .2s ease",
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: color,
          opacity: .15,
          marginBottom: 18,
        }}
      />

      <div
        style={{
          color: "#6b7280",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 34,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}
