// @ts-nocheck
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InactivityMonitor from "./components/InactivityMonitor";
import ConditionalLayout from "./components/ConditionalLayout";
import HeroUIProvider from "./components/HeroUIProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard for All",
  description:
    "Unified business intelligence platform with real-time analytics, multi-department dashboards, and actionable insights across your organization",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeroUIProvider>
          <InactivityMonitor />
          <ConditionalLayout>{children}</ConditionalLayout>
        </HeroUIProvider>
      </body>
    </html>
  );
}
