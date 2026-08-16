"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  Printer,
  Sparkles,
  ArrowLeft,
  FileText,
  Eye,
  Edit3,
  ShieldCheck,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResumeData } from "@/types/resume";
import { defaultResumeData } from "@/lib/default-resume";
import ResumeEditor from "@/components/admin/resume/resume-editor";
import ResumePreview from "@/components/admin/resume/resume-preview";
import ATSScoreCard from "@/components/admin/resume/ats-score-card";

export default function AdminResumePage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.95);
  const [mobileView, setMobileView] = useState<"edit" | "preview" | "score">("edit");

  // Load Resume Data on mount
  const loadResumeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/resume", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.status === 401) {
        toast.error("Session expired. Please log in.");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.resume) {
        setResumeData(data.resume);
      } else {
        setResumeData(defaultResumeData);
      }
    } catch (err) {
      console.warn("Failed to load resume data:", err);
      toast.error("Could not load resume data from server");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  // Save Resume Data
  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving ATS Resume...");

    try {
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });

      const data = await res.json();
      if (res.ok) {
        setHasUnsavedChanges(false);
        toast.success("✨ ATS Resume saved & updated live!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to save resume", { id: toastId });
      }
    } catch {
      toast.error("Network error while saving resume", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resumeData]);

  // Sync / Import Data from Portfolio
  const handleImportFromPortfolio = async () => {
    if (!confirm("Import latest projects and skills from your portfolio into this resume?")) {
      return;
    }

    const toastId = toast.loading("Fetching portfolio content...");
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();

      if (res.ok && data.content) {
        const content = data.content;

        // Map projects
        const importedProjects = (content.projects || []).slice(0, 4).map((p: any) => ({
          id: `proj-${p.id}`,
          name: p.video_title || "Video Project",
          role: "Lead Video Editor",
          tools: p.software_used || ["DaVinci Resolve", "After Effects"],
          link: `https://www.itsmanuel.me/project/${p.id}`,
          description: p.video_description || "High-retention video production with custom pacing and graphics.",
          highlights: [
            `Edited and produced for ${p.client_name || "Enterprise Client"} with duration ${p.duration || "5:00"}.`,
          ],
        }));

        // Map skills
        const techSkills = (content.skills?.technicalSkills || []).map((t: any) => t.name);
        const specializations = (content.skills?.specializations || []).flatMap((s: any) => s.skills || []);

        const importedSkills = [
          {
            id: "cat-imported-1",
            category: "Core Editing & Tools",
            skills: techSkills.length > 0 ? techSkills : ["DaVinci Resolve Studio", "Premiere Pro", "After Effects"],
          },
          {
            id: "cat-imported-2",
            category: "Specializations & Workflow",
            skills: specializations.length > 0 ? specializations : ["Color Grading", "Audio Mixing", "Motion Graphics"],
          },
        ];

        setResumeData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName: `${content.about?.profile?.firstName || "Emmanuel"} ${content.about?.profile?.lastName || "Olaitan"}`.trim(),
            professionalTitle: content.about?.profile?.title || prev.personalInfo.professionalTitle,
            email: content.contact?.email || prev.personalInfo.email,
            location: content.contact?.location || prev.personalInfo.location,
            summary: content.general?.siteDescription || prev.personalInfo.summary,
          },
          projects: importedProjects.length > 0 ? importedProjects : prev.projects,
          skills: importedSkills,
        }));

        setHasUnsavedChanges(true);
        toast.success("✨ Successfully imported portfolio projects & skills!", { id: toastId });
      } else {
        toast.error("Could not load portfolio content", { id: toastId });
      }
    } catch {
      toast.error("Failed to sync from portfolio", { id: toastId });
    }
  };

  const handleResumeChange = (updated: ResumeData) => {
    setResumeData(updated);
    setHasUnsavedChanges(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium text-gray-400">Loading ATS Resume Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      {/* ========================================================================= */}
      {/* TOP ADMIN HEADER BAR (Non-Printable) */}
      {/* ========================================================================= */}
      <header className="no-print sticky top-0 z-40 bg-[#060b18]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Admin Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">ATS Resume Builder</h1>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Standard Applicant Tracking System (ATS) Format
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {hasUnsavedChanges && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Unsaved changes
            </span>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Export ATS PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? "Saving..." : "Save Resume"}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SWITCHER BAR (Non-Printable) */}
      {/* ========================================================================= */}
      <div className="no-print lg:hidden p-3 bg-[#030712] border-b border-white/10 sticky top-[61px] z-30 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-1 w-full max-w-md p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setMobileView("edit")}
            className={`py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileView === "edit" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <Edit3 size={13} />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileView === "preview" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <Eye size={13} />
            <span>ATS Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView("score")}
            className={`py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileView === "score" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldCheck size={13} />
            <span>Audit Score</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN BODY: SPLIT VIEW ON DESKTOP / TAB VIEW ON MOBILE */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: RESUME EDITOR & SCORE (Desktop always visible, mobile controlled) */}
          <div
            className={`lg:col-span-6 xl:col-span-5 space-y-6 ${
              mobileView === "edit" ? "block" : mobileView === "score" ? "hidden lg:block" : "hidden lg:block"
            }`}
          >
            <ResumeEditor
              data={resumeData}
              onChange={handleResumeChange}
              onImportFromPortfolio={handleImportFromPortfolio}
            />

            <div className="hidden lg:block">
              <ATSScoreCard data={resumeData} />
            </div>
          </div>

          {/* RIGHT COLUMN: ATS PRINTABLE PREVIEW SHEET */}
          <div
            className={`lg:col-span-6 xl:col-span-7 flex flex-col items-center sticky top-24 ${
              mobileView === "preview" ? "block w-full" : "hidden lg:flex"
            }`}
          >
            <ResumePreview
              data={resumeData}
              scale={previewScale}
              onScaleChange={setPreviewScale}
            />
          </div>

          {/* MOBILE ONLY: SCORE CARD VIEW */}
          {mobileView === "score" && (
            <div className="lg:hidden col-span-12">
              <ATSScoreCard data={resumeData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
