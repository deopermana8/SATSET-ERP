import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={[
        "rounded-xl",
        "bg-blue-600",
        "px-5",
        "py-3",
        "font-semibold",
        "text-white",
        "transition-all",
        "hover:bg-blue-700",
        "active:scale-95",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
