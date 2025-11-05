// @ts-nocheck
"use client";

import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to splash page as the default landing page
    router.push("/splash");
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
