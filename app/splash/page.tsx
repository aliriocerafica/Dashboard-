'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashScreen() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash for 2.5 seconds, then redirect to login
    const timer = setTimeout(() => {
      setIsVisible(false);
      
      // After fade-out animation (500ms), redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 500);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo with pulse animation */}
        <div
          className={`transform transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
          }`}
        >
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#ff6d74] rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <Image src="/Logo.png" alt="Logo" width={50} height={50} />
          </div>
        </div>

        {/* Text */}
        <div
          className={`text-center transform transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
          }`}
        >
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-[#ff6d74] text-sm md:text-base font-medium">Business Intelligence Platform</p>
        </div>

        {/* Loading indicator */}
        <div
          className={`transform transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
          }`}
        >
          <div className="flex gap-2 mt-4">
            <div className="w-2 h-2 bg-[#ff6d74] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-[#ff6d74] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#ff6d74] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
