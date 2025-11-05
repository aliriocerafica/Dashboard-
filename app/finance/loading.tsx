"use client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function FinanceLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <LoadingSpinner size="lg" text="Loading Finance dashboard..." />
    </div>
  );
}


