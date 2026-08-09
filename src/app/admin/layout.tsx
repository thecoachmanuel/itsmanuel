import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard | Emmanuel Olaitan Portfolio",
  description: "Manage all portfolio sections, projects, skills, and site settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#030712] text-white antialiased selection:bg-blue-500/30 selection:text-blue-200`}>
      {children}
      <Toaster position="top-right" richColors theme="dark" />
    </div>
  );
}
