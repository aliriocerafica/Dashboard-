import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-100 text-blue-800",
    secondary: "border-transparent bg-gray-100 text-gray-800",
    destructive: "border-transparent bg-red-100 text-red-800",
    outline: "text-foreground border border-gray-200",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
        variants[variant]
      } ${className || ""}`}
      {...props}
    />
  );
}

export { Badge };
