"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Film,
  Tags,
  Briefcase,
  UserCheck,
  Building2,
  Award,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Database,
  Inbox,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface NavSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badgeKey?: string;
}

export const adminSections: NavSection[] = [
  { id: "overview", name: "Overview & Stats", icon: LayoutDashboard },
  { id: "resume", name: "ATS Resume Builder", icon: FileText },
  { id: "messages", name: "Messages & Inquiries", icon: Inbox, badgeKey: "unreadMessages" },
  { id: "hero", name: "Hero & Intro", icon: Sparkles },
  { id: "projects", name: "Projects (CRUD)", icon: Film },
  { id: "categories", name: "Categories", icon: Tags },
  { id: "services", name: "Services", icon: Briefcase },
  { id: "about", name: "About & Bento Grid", icon: UserCheck },
  { id: "clients", name: "Clients & Marquee", icon: Building2 },
  { id: "skills", name: "Skills & Workflow", icon: Award },
  { id: "contact", name: "Contact & Info", icon: Mail },
  { id: "settings", name: "SEO & Settings", icon: Settings },
];

interface AdminSidebarProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  dbStatus?: { connected: boolean; databaseName?: string | null };
  unreadMessagesCount?: number;
}

export default function AdminSidebar({
  activeSection,
  onSelectSection,
  dbStatus,
  unreadMessagesCount = 0,
}: AdminSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSectionClick = (id: string) => {
    onSelectSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#030712]/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">itsManuel</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-semibold">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadMessagesCount > 0 && (
            <button
              onClick={() => onSelectSection("messages")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-md shadow-blue-600/30"
            >
              <Inbox size={13} />
              <span>{unreadMessagesCount}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus?.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="text-gray-300 hidden sm:inline">
              {dbStatus?.connected ? "MongoDB" : "Local Cache"}
            </span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white border border-white/10"
            title="View Live Site"
          >
            <ExternalLink size={16} />
          </Link>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#060b18]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 border border-white/10">
              EM
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-none">itsManuel</h2>
              <p className="text-[11px] text-gray-400 mt-1">Portfolio CMS & Admin</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Database Status Pill */}
        <div className="px-5 py-3 mx-4 my-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Database
              </span>
              <span className="text-xs font-medium text-white truncate max-w-[120px]">
                {dbStatus?.databaseName || (dbStatus?.connected ? "MongoDB Live" : "Local Store")}
              </span>
            </div>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              dbStatus?.connected
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                : "bg-amber-400"
            }`}
            title={dbStatus?.connected ? "Connected to MongoDB" : "Offline / Local fallback"}
          />
        </div>

        {/* Navigation Sections List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Portfolio Sections
          </p>
          {adminSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isMessages = section.id === "messages";

            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-white border border-blue-500/40 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "text-blue-400"
                        : "text-gray-400 group-hover:text-white transition-colors"
                    }
                  />
                  <span>{section.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isMessages && unreadMessagesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                      {unreadMessagesCount}
                    </span>
                  )}
                  {isActive && !isMessages && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-all"
          >
            <ExternalLink size={14} />
            <span>Open Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-medium border border-red-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut size={14} />
            <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
