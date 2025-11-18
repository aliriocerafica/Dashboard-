import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  subtitle?: string;
  gradient?: string;
  className?: string;
}

export default function SummaryCard({
  title,
  value,
  icon,
  subtitle,
  gradient = "from-blue-500 to-blue-600",
  className = "",
}: SummaryCardProps) {
  return (
    <div
      className={`bg-linear-to-br ${gradient} rounded-xl p-6 shadow-lg text-white ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon && <div className="opacity-80">{icon}</div>}
        <div className={`text-sm font-medium opacity-90 ${icon ? "" : "w-full"}`}>
          {title}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && <div className="text-sm opacity-80">{subtitle}</div>}
    </div>
  );
}

