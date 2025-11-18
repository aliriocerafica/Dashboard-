import { ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  color?: "blue" | "purple" | "emerald" | "indigo";
}

const colorClasses = {
  blue: "border-blue-500 text-blue-600",
  purple: "border-purple-500 text-purple-600",
  emerald: "border-emerald-500 text-emerald-600",
  indigo: "border-indigo-500 text-indigo-600",
};

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  color = "blue",
}: TabNavigationProps) {
  const activeColor = colorClasses[color];

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? `${activeColor}`
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

