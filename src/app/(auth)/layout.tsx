import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - FreshHire",
  description: "Sign in to your FreshHire account to access job opportunities, career guidance, and more.",
  keywords: ["login", "sign in", "freshhire", "job portal", "career"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
