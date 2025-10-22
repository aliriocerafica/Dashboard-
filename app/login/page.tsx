"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../components/LoginForm";
import { isAuthenticated } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      router.push("/home");
    }
  }, [router]);

  const handleLoginSuccess = () => {
    // Redirect to home after successful login
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
