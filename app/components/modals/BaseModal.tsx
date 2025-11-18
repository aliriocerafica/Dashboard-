import { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  headerGradient?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-7xl",
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "xl",
  headerGradient = true,
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div
          className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
        >
          {/* Header */}
          <div
            className={
              headerGradient
                ? "bg-linear-to-r from-blue-500 to-purple-600 px-6 py-4"
                : "bg-gray-50 px-6 py-4 border-b border-gray-200"
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    headerGradient ? "text-white" : "text-gray-900"
                  }`}
                >
                  {title}
                </h2>
                {description && (
                  <p
                    className={`text-sm mt-1 ${
                      headerGradient ? "text-white/80" : "text-gray-600"
                    }`}
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className={`transition-colors ${
                  headerGradient
                    ? "text-white hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

