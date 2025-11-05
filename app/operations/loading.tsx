"use client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function OperationsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <LoadingSpinner size="lg" text="Loading Operations dashboard..." />
    </div>
  );
}


