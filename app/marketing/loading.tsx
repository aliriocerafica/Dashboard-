"use client";
import React from "react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MarketingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <LoadingSpinner size="lg" text="Loading Marketing dashboard..." />
    </div>
  );
}


