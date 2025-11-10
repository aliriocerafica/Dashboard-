"use client";

import React from "react";

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "colored";
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "yellow" | "indigo" | "red";
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = "",
  variant = "default",
  color = "blue",
  onClick,
}) => {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    orange: "from-orange-50 to-orange-100 border-orange-200",
    pink: "from-pink-50 to-pink-100 border-pink-200",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200",
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200",
    red: "from-red-50 to-red-100 border-red-200",
  };

  const gradientClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
    yellow: "from-yellow-500 to-yellow-600",
    indigo: "from-indigo-500 to-indigo-600",
    red: "from-red-500 to-red-600",
  };

  const baseClasses = `
    rounded-2xl 
    shadow-md 
    hover:shadow-xl 
    transition-all 
    duration-300 
    transform 
    hover:scale-[1.02]
    active:scale-[0.98]
    ${onClick ? "cursor-pointer" : ""}
  `;

  const variantClass =
    variant === "gradient"
      ? `bg-gradient-to-br ${gradientClasses[color]} text-white border-0`
      : variant === "colored"
      ? `bg-gradient-to-br ${colorClasses[color]} border-2`
      : "bg-white border border-gray-100";

  return (
    <div
      className={`${baseClasses} ${variantClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "yellow" | "indigo" | "red";
  variant?: "gradient" | "colored";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = "blue",
  variant = "gradient",
  onClick,
}) => {
  return (
    <MobileCard variant={variant} color={color} className="p-4 sm:p-5" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className={`text-xs sm:text-sm font-medium mb-1 ${
            variant === "gradient" ? "text-white/80" : "text-gray-600"
          }`}>
            {title}
          </p>
          <h3 className={`text-2xl sm:text-3xl font-bold ${
            variant === "gradient" ? "text-white" : "text-gray-900"
          }`}>
            {value}
          </h3>
        </div>
        {icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
            variant === "gradient" ? "bg-white/20" : `bg-${color}-100`
          }`}>
            {icon}
          </div>
        )}
      </div>
      
      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
          {subtitle && (
            <p className={`text-xs ${
              variant === "gradient" ? "text-white/70" : "text-gray-500"
            }`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              trend.isPositive
                ? variant === "gradient"
                  ? "bg-white/20 text-white"
                  : "bg-green-100 text-green-700"
                : variant === "gradient"
                ? "bg-white/20 text-white"
                : "bg-red-100 text-red-700"
            }`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      )}
    </MobileCard>
  );
};

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  headerColor?: "blue" | "green" | "purple" | "orange" | "pink" | "yellow" | "indigo" | "red";
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  action,
  headerColor = "blue",
}) => {
  const headerColors = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    purple: "from-purple-600 to-purple-700",
    orange: "from-orange-600 to-orange-700",
    pink: "from-pink-600 to-pink-700",
    yellow: "from-yellow-600 to-yellow-700",
    indigo: "from-indigo-600 to-indigo-700",
    red: "from-red-600 to-red-700",
  };

  return (
    <MobileCard className="overflow-hidden">
      <div className={`px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r ${headerColors[headerColor]} flex items-center justify-between`}>
        <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs sm:text-sm font-medium transition-all"
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </MobileCard>
  );
};

