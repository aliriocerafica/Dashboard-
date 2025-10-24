"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back arrow on home page
  if (pathname === "/" || pathname === "/home") {
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center px-4 py-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
    </div>
  );
}

