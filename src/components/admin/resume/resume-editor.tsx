"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  FolderGit2,
  Award,
  GraduationCap,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Layers,
  Database,
  Youtube,
  Eye,
  EyeOff,
  Printer,
} from "lucide-react";
import {
  ResumeData,
  ResumeExperience,
  ResumeProject,
  ResumeSkillCategory,
  ResumeEducation,
  ResumeCertification,
  ResumeCustomSection,
} from "@/types/resume";
import { toast } from "sonner";
import { defaultResumeData } from "@/lib/default-resume";
import ProjectSyncModal from "./project-sync-modal";

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onImportFromPortfolio?: () => void;
  onExportPdf?: () => void;
}

export default function ResumeEditor({
  data,
  onChange,
  onImportFromPortfolio,
  onExportPdf,
}: ResumeEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isProjectSyncOpen, setIsProjectSyncOpen] = useState(false);

  // State for adding skill tags
  const [newSkillInputs, setNewSkillInputs] = useState<{ [catId: string]: string }>({});

  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  const updateSettings = (field: keyof ResumeData["settings"], value: any) => {
    onChange({
      ...data,
      settings: {
        ...data.settings,
        [field]: value,
      },
    });
  };

  // ==========================================
  // Experience Handlers
  // ==========================================
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: `exp-${Date.now()}`,
      title: "Video Editor & Post Specialist",
      company: "New Company / Freelance",
      location: "Remote",
      startDate: "Jan 2023",
      endDate: "Present",
      current: true,
      highlights: [
        "Delivered high-retention video content, resulting in 30%+ increase in viewer engagement.",
      ],
    };
    onChange({
      ...data,
      experience: [newExp, ...(data.experience || [])],
    });
    toast.success("Added new work experience entry");
  };

  const updateExperience = (index: number, updatedExp: ResumeExperience) => {
    const updated = [...(data.experience || [])];
    updated[index] = updatedExp;
    onChange({ ...data, experience: updated });
  };

  const deleteExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((e) => e.id !== id),
    });
    toast.success("Removed experience entry");
  };

  const addHighlightToExperience = (expIndex: number) => {
    const exp = data.experience[expIndex];
    const updatedHighlights = [
      ...(exp.highlights || []),
      "Engineered visual narrative structures with custom motion graphics, reducing revision turnaround by 25%.",
    ];
    updateExperience(expIndex, { ...exp, highlights: updatedHighlights });
  };

  const updateHighlightInExperience = (expIndex: number, hIndex: number, text: string) => {
    const exp = data.experience[expIndex];
    const updatedHighlights = [...(exp.highlights || [])];
    updatedHighlights[hIndex] = text;
    updateExperience(expIndex, { ...exp, highlights: updatedHighlights });
  };

  const deleteHighlightFromExperience = (expIndex: number, hIndex: number) => {
    const exp = data.experience[expIndex];
    const updatedHighlights = exp.highlights.filter((_, i) => i !== hIndex);
    updateExperience(expIndex, { ...exp, highlights: updatedHighlights });
  };

  // ==========================================
  // Projects Handlers
  // ==========================================
  const addProject = () => {
    const newProj: ResumeProject = {
      id: `proj-${Date.now()}`,
      name: "Featured Video Campaign",
      role: "Lead Video Editor",
      tools: ["DaVinci Resolve", "After Effects"],
      link: "https://itsmanuel.vercel.app",
      description: "High-impact video storytelling with custom sound design and pacing.",
      highlights: ["Achieved 45%+ average retention rate and 100k+ organic views."],
    };
    onChange({
      ...data,
      projects: [newProj, ...(data.projects || [])],
    });
    toast.success("Added new project highlight");
  };

  const updateProject = (index: number, updatedProj: ResumeProject) => {
    const updated = [...(data.projects || [])];
    updated[index] = updatedProj;
    onChange({ ...data, projects: updated });
  };

  const deleteProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
    toast.success("Removed project");
  };

  // ==========================================
  // Skills Matrix Handlers
  // ==========================================
  const addSkillCategory = () => {
    const newCat: ResumeSkillCategory = {
      id: `cat-${Date.now()}`,
      category: "Specialized Workflow & Tools",
      skills: ["Video Editing", "Motion Graphics"],
    };
    onChange({
      ...data,
      skills: [...(data.skills || []), newCat],
    });
  };

  const updateSkillCategoryName = (catIndex: number, name: string) => {
    const updated = [...(data.skills || [])];
    updated[catIndex] = { ...updated[catIndex], category: name };
    onChange({ ...data, skills: updated });
  };

  const deleteSkillCategory = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((c) => c.id !== id),
    });
  };

  const addSkillTag = (catIndex: number, catId: string) => {
    const text = (newSkillInputs[catId] || "").trim();
    if (!text) return;

    const cat = data.skills[catIndex];
    if (!cat.skills.includes(text)) {
      const updatedCat = { ...cat, skills: [...cat.skills, text] };
      const updated = [...data.skills];
      updated[catIndex] = updatedCat;
      onChange({ ...data, skills: updated });
    }
    setNewSkillInputs((prev) => ({ ...prev, [catId]: "" }));
  };

  const removeSkillTag = (catIndex: number, skillName: string) => {
    const cat = data.skills[catIndex];
    const updatedCat = { ...cat, skills: cat.skills.filter((s) => s !== skillName) };
    const updated = [...data.skills];
    updated[catIndex] = updatedCat;
    onChange({ ...data, skills: updated });
  };

  // ==========================================
  // Education & Certifications Handlers
  // ==========================================
  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: `edu-${Date.now()}`,
      degree: "B.Sc. in Digital Media",
      institution: "University Name",
      location: "Lagos, Nigeria",
      graduationYear: "2021",
    };
    onChange({
      ...data,
      education: [...(data.education || []), newEdu],
    });
  };

  const addCertification = () => {
    const newCert: ResumeCertification = {
      id: `cert-${Date.now()}`,
      name: "DaVinci Resolve Certified Specialist",
      issuer: "Blackmagic Design",
      issueDate: "2023",
    };
    onChange({
      ...data,
      certifications: [...(data.certifications || []), newCert],
    });
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm("Reset resume fields to the default ATS video editor template?")) {
      onChange(defaultResumeData);
      toast.success("Resume reset to default ATS template");
    }
  };

  const editorTabs = [
    { id: "personal", label: "Contact & Bio", icon: User },
    { id: "experience", label: `Experience (${data.experience?.length || 0})`, icon: Briefcase },
    {
      id: "projects",
      label: `Projects (${data.projects?.length || 0})${data.settings.showProjects ? "" : " • Hidden"}`,
      icon: FolderGit2,
    },
    { id: "skills", label: "Skills Matrix", icon: Award },
    { id: "education", label: "Education & Certs", icon: GraduationCap },
    { id: "settings", label: "ATS Layout", icon: Sliders },
  ];

  return (
    <div className="space-y-4">
      {/* Top Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          <span className="text-xs font-semibold text-white">ATS Document Editor</span>
        </div>

        <div className="flex items-center gap-2">
          {onImportFromPortfolio && (
            <button
              type="button"
              onClick={onImportFromPortfolio}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Auto-fill projects, tools and about data from your live portfolio"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Sync Portfolio</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onExportPdf) onExportPdf();
              else window.print();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Export standard ATS PDF / Print"
          >
            <Printer size={13} />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset fields to standard default ATS template"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Pill Bar */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 custom-scrollbar">
        {editorTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-gray-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: PERSONAL INFO & HEADER */}
        {/* ========================================================================= */}
        {activeTab === "personal" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-white">Contact & Header Details</h3>
              <p className="text-xs text-gray-400">
                Ensure contact details match your portfolio and LinkedIn profiles.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  placeholder="Emmanuel Olaitan"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Professional Headline / Title *
                </label>
                <input
                  type="text"
                  value={data.personalInfo.professionalTitle}
                  onChange={(e) => updatePersonalInfo("professionalTitle", e.target.value)}
                  placeholder="Senior Video Editor & Post-Production Specialist"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  placeholder="eomedia0@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={data.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  placeholder="+234 810 000 0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Location (City, Country / Remote) *
                </label>
                <input
                  type="text"
                  value={data.personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  placeholder="Lagos, Nigeria (Available Globally / Remote)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Portfolio Website URL
                </label>
                <input
                  type="text"
                  value={data.personalInfo.websiteUrl}
                  onChange={(e) => updatePersonalInfo("websiteUrl", e.target.value)}
                  placeholder="https://itsmanuel.vercel.app"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={data.personalInfo.instagramUrl || ""}
                  onChange={(e) => updatePersonalInfo("instagramUrl", e.target.value)}
                  placeholder="https://instagram.com/itsmanuel_"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  YouTube / Portfolio Channel URL
                </label>
                <input
                  type="text"
                  value={data.personalInfo.youtubeOrGithubUrl}
                  onChange={(e) => updatePersonalInfo("youtubeOrGithubUrl", e.target.value)}
                  placeholder="https://youtube.com/@itsmanuel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Professional Summary (ATS High-Impact Bio)
                </label>
                <span className="text-[11px] text-gray-400">
                  Words: {data.personalInfo.summary?.trim() ? data.personalInfo.summary.trim().split(/\s+/).length : 0} (Ideal: 40-100 words)
                </span>
              </div>
              <textarea
                rows={4}
                value={data.personalInfo.summary}
                onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                placeholder="Results-driven Senior Video Editor with 5+ years of experience..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tip: Highlight key software, years of experience, and quantified achievements.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WORK EXPERIENCE */}
        {/* ========================================================================= */}
        {activeTab === "experience" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Work Experience</h3>
                <p className="text-xs text-gray-400">
                  List professional roles in reverse chronological order with action-oriented bullets.
                </p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Plus size={14} />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-4">
              {(data.experience || []).map((exp, expIdx) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Role #{expIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteExperience(exp.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      title="Remove Role"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(expIdx, { ...exp, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Company / Organization *
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(expIdx, { ...exp, company: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Location (e.g. Remote, City)
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(expIdx, { ...exp, location: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(expIdx, { ...exp, startDate: e.target.value })}
                          placeholder="e.g. Jan 2021"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(expIdx, { ...exp, endDate: e.target.value })}
                          placeholder="e.g. Present"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        Achievement Bullet Points ({exp.highlights?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={() => addHighlightToExperience(expIdx)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(exp.highlights || []).map((highlight, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2">
                          <span className="text-gray-400 text-xs mt-2">•</span>
                          <textarea
                            rows={2}
                            value={highlight}
                            onChange={(e) =>
                              updateHighlightInExperience(expIdx, hIdx, e.target.value)
                            }
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => deleteHighlightFromExperience(expIdx, hIdx)}
                            className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer mt-1"
                            title="Remove Bullet"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KEY PROJECTS */}
        {/* ========================================================================= */}
        {activeTab === "projects" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Key Projects & Client Deliverables</h3>
                <p className="text-xs text-gray-400">
                  Highlight significant video projects, YouTube links, technical tools utilized, and metrics achieved.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateSettings("showProjects", !data.settings.showProjects)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    data.settings.showProjects
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                  }`}
                  title={
                    data.settings.showProjects
                      ? "Click to hide Key Projects & Client Deliverables from resume"
                      : "Click to show Key Projects & Client Deliverables on resume"
                  }
                >
                  {data.settings.showProjects ? <Eye size={13} /> : <EyeOff size={13} />}
                  <span>{data.settings.showProjects ? "Visible on Resume" : "Hidden from Resume"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsProjectSyncOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  title="Import and sync projects directly from your MongoDB database"
                >
                  <Database size={13} className="text-blue-400" />
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Sync MongoDB Projects</span>
                </button>

                <button
                  type="button"
                  onClick={addProject}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {/* Hidden Section Notice */}
            {!data.settings.showProjects && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <EyeOff size={15} className="text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Key Projects & Client Deliverables</strong> section is currently{" "}
                    <span className="font-bold underline">HIDDEN</span> from the ATS resume and PDF export.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings("showProjects", true)}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold text-xs whitespace-nowrap cursor-pointer transition-colors"
                >
                  Unhide Section
                </button>
              </div>
            )}

            {/* Project Sync Modal */}
            <ProjectSyncModal
              isOpen={isProjectSyncOpen}
              onClose={() => setIsProjectSyncOpen(false)}
              onApplyProjects={(syncedProjects, append) => {
                if (append) {
                  onChange({
                    ...data,
                    projects: [...(data.projects || []), ...syncedProjects],
                  });
                } else {
                  onChange({
                    ...data,
                    projects: syncedProjects,
                  });
                }
              }}
            />

            <div className="space-y-4">
              {(data.projects || []).map((proj, pIdx) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Project #{pIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteProject(proj.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => updateProject(pIdx, { ...proj, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Role / Contribution
                      </label>
                      <input
                        type="text"
                        value={proj.role}
                        onChange={(e) => updateProject(pIdx, { ...proj, role: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Tools Used (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={proj.tools?.join(", ") || ""}
                        onChange={(e) =>
                          updateProject(pIdx, {
                            ...proj,
                            tools: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="DaVinci Resolve, After Effects, Fairlight"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Project Link / URL
                      </label>
                      <input
                        type="text"
                        value={proj.link || ""}
                        onChange={(e) => updateProject(pIdx, { ...proj, link: e.target.value })}
                        placeholder="https://itsmanuel.vercel.app/project/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Project Description & ATS Outcomes
                    </label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(pIdx, { ...proj, description: e.target.value })}
                      placeholder="Comprehensive educational series with complex software architecture explanations..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SKILLS MATRIX */}
        {/* ========================================================================= */}
        {activeTab === "skills" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Technical Skills Matrix</h3>
                <p className="text-xs text-gray-400">
                  Organize skills by category for optimal ATS keyword indexing and readability.
                </p>
              </div>
              <button
                type="button"
                onClick={addSkillCategory}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Plus size={14} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="space-y-4">
              {(data.skills || []).map((cat, catIdx) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => updateSkillCategoryName(catIdx, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-300 flex-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => deleteSkillCategory(cat.id)}
                      className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                      title="Remove Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillTag(catIdx, skill)}
                          className="hover:text-red-400 cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Tag Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInputs[cat.id] || ""}
                      onChange={(e) =>
                        setNewSkillInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkillTag(catIdx, cat.id);
                        }
                      }}
                      placeholder="Type skill & press Enter..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addSkillTag(catIdx, cat.id)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: EDUCATION & CERTIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === "education" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Education</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Degree</span>
                </button>
              </div>

              {(data.education || []).map((edu, eduIdx) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-300">Degree #{eduIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...data,
                          education: data.education.filter((e) => e.id !== edu.id),
                        })
                      }
                      className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[eduIdx] = { ...updated[eduIdx], degree: e.target.value };
                        onChange({ ...data, education: updated });
                      }}
                      placeholder="Degree (e.g. B.Sc. Media & Communications)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />

                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[eduIdx] = { ...updated[eduIdx], institution: e.target.value };
                        onChange({ ...data, education: updated });
                      }}
                      placeholder="Institution (e.g. University of Lagos)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />

                    <input
                      type="text"
                      value={edu.location || ""}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[eduIdx] = { ...updated[eduIdx], location: e.target.value };
                        onChange({ ...data, education: updated });
                      }}
                      placeholder="Location (e.g. Lagos, Nigeria)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />

                    <input
                      type="text"
                      value={edu.graduationYear}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[eduIdx] = { ...updated[eduIdx], graduationYear: e.target.value };
                        onChange({ ...data, education: updated });
                      }}
                      placeholder="Year (e.g. 2020)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Certifications & Licenses</h3>
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Certificate</span>
                </button>
              </div>

              {(data.certifications || []).map((cert, cIdx) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-300">Credential #{cIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...data,
                          certifications: data.certifications.filter((c) => c.id !== cert.id),
                        })
                      }
                      className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => {
                        const updated = [...data.certifications];
                        updated[cIdx] = { ...updated[cIdx], name: e.target.value };
                        onChange({ ...data, certifications: updated });
                      }}
                      placeholder="Certification Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />

                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => {
                        const updated = [...data.certifications];
                        updated[cIdx] = { ...updated[cIdx], issuer: e.target.value };
                        onChange({ ...data, certifications: updated });
                      }}
                      placeholder="Issuer (e.g. Blackmagic Design)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />

                    <input
                      type="text"
                      value={cert.issueDate}
                      onChange={(e) => {
                        const updated = [...data.certifications];
                        updated[cIdx] = { ...updated[cIdx], issueDate: e.target.value };
                        onChange({ ...data, certifications: updated });
                      }}
                      placeholder="Issue Date (e.g. 2023)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ATS LAYOUT & SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-white">ATS Template & Density Settings</h3>
              <p className="text-xs text-gray-400">
                Adjust typography sizing and toggle sections to fit single or multi-page formats.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  ATS Template Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "classic-ats", label: "Classic ATS" },
                    { id: "modern-ats", label: "Modern ATS" },
                    { id: "compact-ats", label: "Compact 1-Page" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateSettings("template", t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        data.settings.template === t.id
                          ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                          : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Document Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "small", label: "Small (Dense)" },
                    { id: "medium", label: "Medium (Standard)" },
                    { id: "large", label: "Large (Clean)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => updateSettings("fontSize", s.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        data.settings.fontSize === s.id
                          ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                          : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Visibility Toggles */}
            <div className="pt-3 border-t border-white/5 space-y-3">
              <label className="block text-xs font-semibold text-gray-300">
                Visible ATS Resume Sections
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { key: "showSummary", label: "Professional Summary" },
                  { key: "showExperience", label: "Work Experience" },
                  { key: "showProjects", label: "Key Projects & Deliverables" },
                  { key: "showSkills", label: "Technical Skills" },
                  { key: "showEducation", label: "Education" },
                  { key: "showCertifications", label: "Certifications" },
                  { key: "showCustomSections", label: "Additional Strengths" },
                ].map((sec) => {
                  const isVisible = data.settings[sec.key as keyof typeof data.settings];
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => updateSettings(sec.key as any, !isVisible)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isVisible
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-white/5 border-white/10 text-gray-400 opacity-60"
                      }`}
                    >
                      <span>{sec.label}</span>
                      <span>{isVisible ? "✓" : "✕"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
