import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Spotlight from "@/components/Spotlight";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathForge - AI-Powered Career Guidance for Software Engineers",
  description:
    "Forge your path to engineering excellence with AI-powered resume analysis and personalized career roadmaps for software engineers.",
  keywords: [
    "software engineer",
    "career roadmap",
    "resume analysis",
    "tech careers",
    "engineering growth",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-black text-white`}
      >
        {/* Animated Grid Background */}
        <div className="grid-background" />

        {/* Spotlight Effect */}
        <Spotlight />

        {/* Main Content */}
        <div className="relative z-10">{children}<Analytics /></div>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#111",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
