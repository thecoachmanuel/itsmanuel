"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  ExternalLink,
  Film,
  Building2,
  Search,
  Database,
  Inbox,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Check,
  ShieldCheck,
  KeyRound,
  Lock,
  ImageIcon,
  Wrench,
  FileText,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/admin-sidebar";
import ProjectModal from "@/components/admin/project-modal";
import ResumeEditor from "@/components/admin/resume/resume-editor";
import ResumePreview from "@/components/admin/resume/resume-preview";
import ATSScoreCard from "@/components/admin/resume/ats-score-card";
import { ResumeData } from "@/types/resume";
import { defaultResumeData } from "@/lib/default-resume";
import { SiteContent, ContactMessage, TechnicalSkill } from "@/types/content";
import { VideoProject, Client } from "@/types/videos";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    databaseName?: string | null;
    latencyMs?: number;
    documentCount?: number;
  }>({ connected: false });

  // Contact Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageFilter, setMessageFilter] = useState<"all" | "unread" | "read">("all");
  const [messageSearch, setMessageSearch] = useState("");

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<VideoProject | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("All");

  // New Category input
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Admin Credentials State
  const [currentAdminUsername, setCurrentAdminUsername] = useState("admin");
  const [newUsernameInput, setNewUsernameInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Resume Data State
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [hasResumeChanges, setHasResumeChanges] = useState(false);

  // Fetch Full Site Content, DB status, Contact Messages, Admin Credentials, and Resume
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contentRes, dbRes, messagesRes, credsRes, resumeRes] = await Promise.all([
        fetch("/api/admin/content"),
        fetch("/api/admin/db-status"),
        fetch("/api/admin/messages"),
        fetch("/api/admin/credentials"),
        fetch("/api/admin/resume"),
      ]);

      const contentData = await contentRes.json();
      const dbData = await dbRes.json();
      const messagesData = await messagesRes.json();
      const credsData = await credsRes.json();

      if (contentRes.ok && contentData.content) {
        setContent(contentData.content);
      } else {
        toast.error(contentData.error || "Failed to load content");
      }

      if (dbRes.ok) {
        setDbStatus(dbData);
      }

      if (messagesRes.ok && messagesData.messages) {
        setMessages(messagesData.messages);
        setUnreadCount(messagesData.unreadCount || 0);
      }

      if (credsRes.ok && credsData.username) {
        setCurrentAdminUsername(credsData.username);
        setNewUsernameInput(credsData.username);
      }

      if (resumeRes.ok) {
        const resumeJson = await resumeRes.json();
        if (resumeJson.resume) {
          setResumeData(resumeJson.resume);
        }
      }
    } catch {
      toast.error("Failed to connect to backend server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save ATS Resume
  const handleSaveResume = async () => {
    setIsSavingResume(true);
    const toastId = toast.loading("Saving ATS Resume...");
    try {
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });
      const data = await res.json();
      if (res.ok) {
        setHasResumeChanges(false);
        toast.success("✨ ATS Resume saved & updated live!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to save resume", { id: toastId });
      }
    } catch {
      toast.error("Network error while saving resume", { id: toastId });
    } finally {
      setIsSavingResume(false);
    }
  };

  // Sync / Import Data from Portfolio to Resume
  const handleImportFromPortfolioForAdmin = () => {
    if (!content) return;
    if (!confirm("Import latest projects and skills from your portfolio into the ATS resume?")) {
      return;
    }

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

    setHasResumeChanges(true);
    toast.success("✨ Successfully imported portfolio projects & skills into resume!");
  };

  // Save changes to MongoDB
  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "full", data: content }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("All changes saved to MongoDB & published live!");
        setContent(result.content);
        setHasUnsavedChanges(false);
      } else {
        toast.error(result.error || "Failed to save changes");
      }
    } catch {
      toast.error("Network error while saving changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to mutate state and mark unsaved
  const updateContent = <K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K]
  ) => {
    if (!content) return;
    setContent({ ...content, [key]: value });
    setHasUnsavedChanges(true);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    if (!content) return;
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `itsmanuel-content-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded successfully");
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setContent(parsed);
        setHasUnsavedChanges(true);
        toast.success("JSON backup loaded! Review and click Save Changes.");
      } catch {
        toast.error("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
  };

  // Update Admin Credentials
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput) {
      toast.error("Please enter your current password to save changes");
      return;
    }

    setIsUpdatingCreds(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername: newUsernameInput,
          newPassword: newPasswordInput || undefined,
          currentPassword: currentPasswordInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Admin credentials updated in .env.local successfully!");
        setCurrentAdminUsername(data.username);
        setCurrentPasswordInput("");
        setNewPasswordInput("");
      } else {
        toast.error(data.error || "Failed to update credentials");
      }
    } catch {
      toast.error("Network error while updating credentials");
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // Generic Image Upload Helper
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    const inputElement = e.target;
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const toastId = toast.loading("Uploading image asset...");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onSuccess(data.url);
      setHasUnsavedChanges(true);
      toast.success("Image uploaded successfully! Click 'Save & Publish Live' to publish.", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image", { id: toastId });
    } finally {
      if (inputElement) inputElement.value = "";
    }
  };

  // Messages CRUD Actions
  const handleDeleteMessage = async (id: string, senderName: string) => {
    if (!confirm(`Are you sure you want to delete message from "${senderName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id && m.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success(`Message from "${senderName}" deleted`);
      } else {
        toast.error("Failed to delete message");
      }
    } catch {
      toast.error("Error connecting to server to delete message");
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    const newReadStatus = !currentRead;
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: newReadStatus }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === id || m.id === id ? { ...m, read: newReadStatus } : m
          )
        );
        setUnreadCount((prev) =>
          newReadStatus ? Math.max(0, prev - 1) : prev + 1
        );
      }
    } catch {
      toast.error("Failed to update message status");
    }
  };

  // Project CRUD Actions with instant auto-save and live publishing
  const handleSaveProject = async (savedProject: VideoProject) => {
    if (!content) return;
    const existingIndex = content.projects.findIndex((p) => p.id === savedProject.id);

    let updatedProjects: VideoProject[];
    const isEdit = existingIndex >= 0;
    if (isEdit) {
      updatedProjects = [...content.projects];
      updatedProjects[existingIndex] = savedProject;
    } else {
      updatedProjects = [savedProject, ...content.projects];
    }

    const optimisticContent = { ...content, projects: updatedProjects };
    setContent(optimisticContent);

    const toastId = toast.loading(
      isEdit
        ? `Publishing updates for "${savedProject.video_title}" live...`
        : `Publishing new project "${savedProject.video_title}" live...`
    );

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "partial",
          data: { projects: updatedProjects },
        }),
      });

      const result = await res.json();
      if (res.ok) {
        if (result.content) {
          setContent(result.content);
        }
        setHasUnsavedChanges(false);
        toast.success(
          isEdit
            ? `Project "${savedProject.video_title}" updated & live instantly!`
            : `Project "${savedProject.video_title}" created & live instantly!`,
          { id: toastId }
        );
      } else {
        toast.error(result.error || "Failed to persist project change to MongoDB", { id: toastId });
        setHasUnsavedChanges(true);
      }
    } catch {
      toast.error("Network error while saving project", { id: toastId });
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!content) return;
    if (!confirm(`Are you sure you want to delete "${title}"? This will remove it from the live website immediately.`)) {
      return;
    }

    const updated = content.projects.filter((p) => p.id !== id);
    const optimisticContent = { ...content, projects: updated };
    setContent(optimisticContent);

    const toastId = toast.loading(`Deleting "${title}" & updating live website...`);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "partial",
          data: { projects: updated },
        }),
      });

      const result = await res.json();
      if (res.ok) {
        if (result.content) {
          setContent(result.content);
        }
        setHasUnsavedChanges(false);
        toast.success(`Project "${title}" deleted & website updated!`, { id: toastId });
      } else {
        toast.error(result.error || "Failed to delete project from database", { id: toastId });
        setHasUnsavedChanges(true);
      }
    } catch {
      toast.error("Network error while deleting project", { id: toastId });
      setHasUnsavedChanges(true);
    }
  };

  // Categories Actions
  const handleAddCategory = async () => {
    if (!content || !newCategoryInput.trim()) return;
    const trimmed = newCategoryInput.trim();
    if (content.categories.includes(trimmed)) {
      toast.info(`Category "${trimmed}" already exists`);
      setNewCategoryInput("");
      return;
    }

    const updated = [...content.categories, trimmed];
    setContent({ ...content, categories: updated });
    setNewCategoryInput("");

    const toastId = toast.loading(`Saving category "${trimmed}"...`);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "partial",
          data: { categories: updated },
        }),
      });
      const result = await res.json();
      if (res.ok) {
        if (result.content) setContent(result.content);
        setHasUnsavedChanges(false);
        toast.success(`Category "${trimmed}" added & published live!`, { id: toastId });
      } else {
        toast.error(result.error || "Failed to save category", { id: toastId });
      }
    } catch {
      toast.error("Network error while saving category", { id: toastId });
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (!content) return;
    if (cat === "All") {
      toast.error("Cannot remove the default 'All' category");
      return;
    }
    if (!confirm(`Delete category "${cat}"? Projects with this category will not be deleted.`)) {
      return;
    }

    const updated = content.categories.filter((c) => c !== cat);
    setContent({ ...content, categories: updated });

    const toastId = toast.loading(`Removing category "${cat}"...`);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "partial",
          data: { categories: updated },
        }),
      });
      const result = await res.json();
      if (res.ok) {
        if (result.content) setContent(result.content);
        setHasUnsavedChanges(false);
        toast.success(`Category "${cat}" removed & website updated!`, { id: toastId });
      } else {
        toast.error(result.error || "Failed to remove category", { id: toastId });
      }
    } catch {
      toast.error("Network error while removing category", { id: toastId });
    }
  };

  // Clients Actions with instant auto-save to MongoDB
  const handleAddNewClientDirectly = async (newClient: Client) => {
    if (!content) return;
    const updatedClients = [...content.clients, newClient];
    setContent({ ...content, clients: updatedClients });

    const toastId = toast.loading(`Saving new client "${newClient.name}"...`);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "partial",
          data: { clients: updatedClients },
        }),
      });
      const result = await res.json();
      if (res.ok) {
        if (result.content) setContent(result.content);
        setHasUnsavedChanges(false);
        toast.success(`Client "${newClient.name}" saved & published live!`, { id: toastId });
      } else {
        toast.error(result.error || "Failed to save client", { id: toastId });
      }
    } catch {
      toast.error("Network error while saving client", { id: toastId });
    }
  };

  const handleAddClient = () => {
    if (!content) return;
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: "New Client",
      logo: "/companies/sl-logo.png",
    };
    handleAddNewClientDirectly(newClient);
  };

  const handleDeleteClient = async (id: string, clientName?: string) => {
    if (!content) return;
    const client = content.clients.find((c) => c.id === id);
    const displayName = clientName || client?.name || "Client";

    if (!confirm(`Are you sure you want to delete client "${displayName}"?`)) {
      return;
    }

    const updatedClients = content.clients.filter((c) => c.id !== id);
    setContent({ ...content, clients: updatedClients });

    const toastId = toast.loading(`Deleting client "${displayName}"...`);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "partial",
          data: { clients: updatedClients },
        }),
      });
      const result = await res.json();
      if (res.ok) {
        if (result.content) setContent(result.content);
        setHasUnsavedChanges(false);
        toast.success(`Client "${displayName}" deleted & website updated!`, { id: toastId });
      } else {
        toast.error(result.error || "Failed to delete client", { id: toastId });
      }
    } catch {
      toast.error("Network error while deleting client", { id: toastId });
    }
  };

  // Services Actions
  const handleAddService = () => {
    if (!content) return;
    const newService = {
      id: `service-${Date.now()}`,
      title: "New Video Service",
      description: "Detailed description of what you deliver for clients.",
      icon: "🎬",
    };
    updateContent("servicesSection", {
      ...content.servicesSection,
      services: [...content.servicesSection.services, newService],
    });
  };

  const handleDeleteService = (id: string) => {
    if (!content) return;
    updateContent("servicesSection", {
      ...content.servicesSection,
      services: content.servicesSection.services.filter((s) => s.id !== id),
    });
  };

  // Technical Software Tools Actions
  const handleAddTool = () => {
    if (!content) return;
    const newTool: TechnicalSkill = {
      name: "New Software Tool",
      image_link: "/skills/davinci.png",
      description: "Professional editing, motion graphics, or 3D VFX tool.",
      color: "text-blue-400",
    };
    const currentList = content.skills.technicalSkills || [];
    const updated = [...currentList, newTool];
    updateContent("skills", { ...content.skills, technicalSkills: updated });
    toast.success("New technical software tool added! Edit details and click 'Save & Publish Live'.");
  };

  const handleDeleteTool = (index: number, toolName: string) => {
    if (!content) return;
    if (confirm(`Are you sure you want to delete "${toolName}"?`)) {
      const updated = content.skills.technicalSkills.filter((_, idx) => idx !== index);
      updateContent("skills", { ...content.skills, technicalSkills: updated });
      toast.success(`Tool "${toolName}" deleted`);
    }
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <p className="text-white font-medium text-lg">Connecting to MongoDB & Loading CMS...</p>
          <p className="text-xs text-gray-400">Synchronizing database models & live credentials</p>
        </div>
      </div>
    );
  }

  // Filtered projects
  const filteredProjects = content.projects.filter((p) => {
    const matchesSearch =
      p.video_title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.client_name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesCat =
      projectCategoryFilter === "All" || p.category.includes(projectCategoryFilter);
    return matchesSearch && matchesCat;
  });

  // Filtered messages
  const filteredMessages = messages.filter((m) => {
    const matchesFilter =
      messageFilter === "all" ||
      (messageFilter === "unread" && !m.read) ||
      (messageFilter === "read" && m.read);

    const matchesSearch =
      m.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.message.toLowerCase().includes(messageSearch.toLowerCase()) ||
      (m.projectType && m.projectType.toLowerCase().includes(messageSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        dbStatus={dbStatus}
        unreadMessagesCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Header with Save Button & Status */}
        <div className="sticky top-0 z-30 bg-[#030712]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight capitalize">
              {activeSection === "messages"
                ? "Messages & Inquiries"
                : activeSection === "skills"
                ? "Skills & Software Tools"
                : activeSection.replace("-", " ")}
            </h1>
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-medium animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              title="Refresh from MongoDB & ENV"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save & Publish Live</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Body */}
        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-8 flex-1">
          {/* ================================================================ */}
          {/* 1. OVERVIEW & STATS TAB */}
          {/* ================================================================ */}
          {activeSection === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/20 border border-white/10 shadow-2xl">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <Sparkles size={14} />
                    Live Content Control Center
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Welcome to your Portfolio CMS
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed font-light">
                    Every section, project, technical tool, skill, and contact detail across the portfolio is stored in{" "}
                    <span className="text-blue-400 font-medium">MongoDB</span>. All edits take effect instantly on your public website.
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveSection("messages")}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 group-hover:text-blue-300">
                      Inquiries
                    </span>
                    <Inbox size={18} className="text-blue-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-3">
                    <p className="text-3xl font-black text-white">{messages.length}</p>
                    {unreadCount > 0 && (
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Captured leads</p>
                </div>

                <div
                  onClick={() => setActiveSection("projects")}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 group-hover:text-purple-300">
                      Total Projects
                    </span>
                    <Film size={18} className="text-purple-400" />
                  </div>
                  <p className="text-3xl font-black text-white mt-3">{content.projects.length}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Across all categories</p>
                </div>

                <div
                  onClick={() => setActiveSection("skills")}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 group-hover:text-blue-300">
                      Software Tools
                    </span>
                    <Wrench size={18} className="text-blue-400" />
                  </div>
                  <p className="text-3xl font-black text-white mt-3">
                    {content.skills.technicalSkills.length}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Editing & 3D apps</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">Database Status</span>
                    <Database size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        dbStatus.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    <p className="text-base font-bold text-white">
                      {dbStatus.connected ? "MongoDB Live" : "Local Cache"}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {dbStatus.connected ? `Latency: ${dbStatus.latencyMs}ms` : "Resilient storage"}
                  </p>
                </div>
              </div>

              {/* Quick Actions & Backup Tools */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white">Data Management & Backups</h3>
                <p className="text-xs text-gray-400">
                  Export complete site data to JSON or restore from a previously downloaded snapshot.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download Full Backup (JSON)</span>
                  </button>

                  <label className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer">
                    <Upload size={15} />
                    <span>Restore from JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportJSON}
                    />
                  </label>

                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium border border-blue-500/30 transition-all ml-auto"
                  >
                    <ExternalLink size={15} />
                    <span>View Public Portfolio</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 1.5. ATS RESUME BUILDER TAB */}
          {/* ================================================================ */}
          {activeSection === "resume" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">ATS Resume Builder & Exporter</h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Standard ATS
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Build and manage your ATS-compliant resume, evaluate compliance score, and export to PDF.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href="/admin/resume"
                    className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Open in dedicated fullscreen ATS workspace"
                  >
                    <ExternalLink size={13} />
                    <span>Open Dedicated Workspace</span>
                  </Link>

                  <button
                    onClick={handleSaveResume}
                    disabled={isSavingResume}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSavingResume ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Save Resume</span>
                  </button>
                </div>
              </div>

              {/* Grid: Editor on Left, Live Sheet Preview on Right */}
              <div className="grid xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-6 space-y-6">
                  <ResumeEditor
                    data={resumeData}
                    onChange={(updated) => {
                      setResumeData(updated);
                      setHasResumeChanges(true);
                    }}
                    onImportFromPortfolio={handleImportFromPortfolioForAdmin}
                  />

                  <ATSScoreCard data={resumeData} />
                </div>

                <div className="xl:col-span-6 sticky top-6">
                  <ResumePreview data={resumeData} />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 2. MESSAGES & INQUIRIES TAB */}
          {/* ================================================================ */}
          {activeSection === "messages" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">Contact Messages & Inquiries</h2>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm shadow-blue-500/40">
                        {unreadCount} Unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Every message submitted on your contact page is captured in MongoDB. You can read, reply, and delete anytime.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{messages.length} Total Messages</span>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    placeholder="Search by sender, email, project type, or content..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setMessageFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      messageFilter === "all"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    All ({messages.length})
                  </button>
                  <button
                    onClick={() => setMessageFilter("unread")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      messageFilter === "unread"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setMessageFilter("read")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      messageFilter === "read"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Read ({messages.length - unreadCount})
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="space-y-4">
                {filteredMessages.map((msg) => {
                  const messageId = msg._id || msg.id || "";
                  const dateStr = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <div
                      key={messageId}
                      className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 ${
                        !msg.read
                          ? "bg-blue-950/20 border-blue-500/30 shadow-lg shadow-blue-900/10"
                          : "bg-white/[0.02] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                            {msg.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-base">{msg.name}</h3>
                              {!msg.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" title="Unread" />
                              )}
                            </div>
                            <a
                              href={`mailto:${msg.email}`}
                              className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              <Mail size={12} />
                              <span>{msg.email}</span>
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {msg.projectType && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium">
                              {msg.projectType}
                            </span>
                          )}
                          {msg.timeline && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium">
                              <Clock size={11} className="inline mr-1 text-gray-400" />
                              {msg.timeline}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{dateStr}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRead(messageId, msg.read)}
                            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check size={14} className={msg.read ? "text-emerald-400" : "text-gray-400"} />
                            <span>{msg.read ? "Mark as Unread" : "Mark as Read"}</span>
                          </button>

                          <a
                            href={`mailto:${msg.email}?subject=Re:%20${encodeURIComponent(
                              msg.projectType || "Your Inquiry"
                            )}&body=Hi%20${encodeURIComponent(
                              msg.name
                            )},%0A%0AThank%20you%20for%20reaching%20out!`}
                            className="text-xs text-blue-300 hover:text-white px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 transition-colors flex items-center gap-1.5"
                          >
                            <Send size={13} />
                            <span>Reply via Email</span>
                          </a>
                        </div>

                        <button
                          onClick={() => handleDeleteMessage(messageId, msg.name)}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Delete this message"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredMessages.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl text-gray-400 space-y-2">
                    <MessageSquare className="mx-auto opacity-30" size={40} />
                    <p className="text-sm font-medium text-white">No messages found</p>
                    <p className="text-xs text-gray-500">
                      When visitors send inquiries on your contact page, they will appear here in real time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 3. HERO & INTRO SECTION TAB */}
          {/* ================================================================ */}
          {activeSection === "hero" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Hero & Introduction Section</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Customize the main landing header, animated badge, headline typography & CTA buttons.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Status Badge Text
                  </label>
                  <input
                    type="text"
                    value={content.hero.badgeText}
                    onChange={(e) =>
                      updateContent("hero", { ...content.hero, badgeText: e.target.value })
                    }
                    placeholder="e.g. Available for Hire"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Headline Line 1 (White Gradient)
                    </label>
                    <input
                      type="text"
                      value={content.hero.titleLine1}
                      onChange={(e) =>
                        updateContent("hero", { ...content.hero, titleLine1: e.target.value })
                      }
                      placeholder="e.g. CINEMATIC"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Headline Line 2 (Color Gradient)
                    </label>
                    <input
                      type="text"
                      value={content.hero.titleLine2}
                      onChange={(e) =>
                        updateContent("hero", { ...content.hero, titleLine2: e.target.value })
                      }
                      placeholder="e.g. EDITOR"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Hero Subtitle Text
                    </label>
                    <textarea
                      rows={2}
                      value={content.hero.subtitle}
                      onChange={(e) =>
                        updateContent("hero", { ...content.hero, subtitle: e.target.value })
                      }
                      placeholder="Turning raw footage into visual stories..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Highlighted Phrase (Glowing)
                    </label>
                    <input
                      type="text"
                      value={content.hero.subtitleHighlight}
                      onChange={(e) =>
                        updateContent("hero", {
                          ...content.hero,
                          subtitleHighlight: e.target.value,
                        })
                      }
                      placeholder="e.g. cinematic magic"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-300">Primary CTA Button</h4>
                    <input
                      type="text"
                      value={content.hero.primaryCtaText}
                      onChange={(e) =>
                        updateContent("hero", { ...content.hero, primaryCtaText: e.target.value })
                      }
                      placeholder="Button Text (e.g. View Work)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={content.hero.primaryCtaLink}
                      onChange={(e) =>
                        updateContent("hero", { ...content.hero, primaryCtaLink: e.target.value })
                      }
                      placeholder="Button Link (e.g. #projects)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-300 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-300">Secondary CTA Button</h4>
                    <input
                      type="text"
                      value={content.hero.secondaryCtaText}
                      onChange={(e) =>
                        updateContent("hero", { ...content.hero, secondaryCtaText: e.target.value })
                      }
                      placeholder="Button Text (e.g. Contact Me)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={content.hero.secondaryCtaLink}
                      onChange={(e) =>
                        updateContent("hero", { ...content.hero, secondaryCtaLink: e.target.value })
                      }
                      placeholder="Button Link (e.g. /contact)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 4. PROJECTS CRUD TAB */}
          {/* ================================================================ */}
          {activeSection === "projects" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Video Projects Manager</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage portfolio videos, YouTube links, client credits, and gallery images ({content.projects.length} Total).
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer w-fit"
                >
                  <Plus size={16} />
                  <span>Add New Project</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects by title, client, or ID..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <select
                  value={projectCategoryFilter}
                  onChange={(e) => setProjectCategoryFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  {content.categories.map((c) => (
                    <option key={c} value={c} className="bg-gray-900">
                      Category: {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Projects Grid / Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                        <Image
                          src={`https://img.youtube.com/vi/${p.cover_image}/maxresdefault.jpg`}
                          alt={p.video_title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {p.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1 rounded text-white font-mono">
                            {p.duration}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {p.category.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{p.video_title}</h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {p.client_name || "Independent"} • {p.publish_date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <Link
                        href={`/project/${p.id}`}
                        target="_blank"
                        className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        <span>Preview Page</span>
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProject(p);
                            setIsProjectModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.video_title)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl text-gray-400">
                  <Film className="mx-auto mb-2 opacity-40" size={32} />
                  <p className="text-sm">No projects matching your search criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* 5. CATEGORIES MANAGER TAB */}
          {/* ================================================================ */}
          {activeSection === "categories" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Project Categories</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage the categories used for filtering projects on the home page and in the portfolio grid.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                    placeholder="Enter new category name (e.g. 3D VFX)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {content.categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-sm font-medium text-white">{cat}</span>
                      {cat !== "All" && (
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 6. SERVICES SECTION TAB */}
          {/* ================================================================ */}
          {activeSection === "services" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Services Section</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage the "What I Can Do For You" cards on the homepage.
                  </p>
                </div>
                <button
                  onClick={handleAddService}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Add Service Card</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {content.servicesSection.services.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={s.icon}
                          onChange={(e) => {
                            const updated = [...content.servicesSection.services];
                            updated[idx] = { ...updated[idx], icon: e.target.value };
                            updateContent("servicesSection", {
                              ...content.servicesSection,
                              services: updated,
                            });
                          }}
                          className="w-12 text-center bg-white/10 border border-white/10 rounded-lg py-1 text-lg"
                        />
                        <input
                          type="text"
                          value={s.title}
                          onChange={(e) => {
                            const updated = [...content.servicesSection.services];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            updateContent("servicesSection", {
                              ...content.servicesSection,
                              services: updated,
                            });
                          }}
                          placeholder="Service Title"
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-bold flex-1"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={s.description}
                      onChange={(e) => {
                        const updated = [...content.servicesSection.services];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        updateContent("servicesSection", {
                          ...content.servicesSection,
                          services: updated,
                        });
                      }}
                      placeholder="Service Description..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-gray-300 resize-none focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 7. ABOUT & BENTO GRID TAB (Profile Live Preview & Uploader) */}
          {/* ================================================================ */}
          {activeSection === "about" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">About Page & Bento Grid</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Customize the profile bento card, live profile image, experience statistics, philosophy quote & socials.
                </p>
              </div>

              {/* Profile Card Settings with Live Image Preview */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Hero Profile Bento Card & Avatar
                </h3>

                {/* Profile Photo Live Preview & Uploader */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/5 border-2 border-blue-500/40 shadow-xl flex-shrink-0 flex items-center justify-center group">
                    {content.about.profile.image ? (
                      <Image
                        src={content.about.profile.image}
                        alt="Profile Preview"
                        fill
                        unoptimized
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <ImageIcon className="text-gray-500" size={32} />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-semibold">
                      Live Preview
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Profile Image Path / Live URL (Editable Anytime)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={content.about.profile.image}
                          onChange={(e) =>
                            updateContent("about", {
                              ...content.about,
                              profile: { ...content.about.profile, image: e.target.value },
                            })
                          }
                          placeholder="/itsmanuel.jpg or https://..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                        <label className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-all">
                          <Upload size={14} />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e, (url) =>
                                updateContent("about", {
                                  ...content.about,
                                  profile: { ...content.about.profile, image: url },
                                })
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Upload a square portrait photo (PNG, JPG, WebP) or enter an existing local/web URL. Changes reflect immediately above and live across the portfolio.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={content.about.profile.firstName}
                      onChange={(e) =>
                        updateContent("about", {
                          ...content.about,
                          profile: { ...content.about.profile, firstName: e.target.value },
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Last Name / Surname (Colored)
                    </label>
                    <input
                      type="text"
                      value={content.about.profile.lastName}
                      onChange={(e) =>
                        updateContent("about", {
                          ...content.about,
                          profile: { ...content.about.profile, lastName: e.target.value },
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Profile Sub-Tagline
                  </label>
                  <input
                    type="text"
                    value={content.about.profile.title}
                    onChange={(e) =>
                      updateContent("about", {
                        ...content.about,
                        profile: { ...content.about.profile, title: e.target.value },
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Stats & Philosophy */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-gray-300">Experience Stat</h4>
                  <input
                    type="text"
                    value={content.about.stats.number}
                    onChange={(e) =>
                      updateContent("about", {
                        ...content.about,
                        stats: { ...content.about.stats, number: e.target.value },
                      })
                    }
                    placeholder="e.g. 5+"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                  <input
                    type="text"
                    value={content.about.stats.label}
                    onChange={(e) =>
                      updateContent("about", {
                        ...content.about,
                        stats: { ...content.about.stats, label: e.target.value },
                      })
                    }
                    placeholder="e.g. Years Active"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-gray-300">Philosophy Quote</h4>
                  <textarea
                    rows={3}
                    value={content.about.philosophy.quote}
                    onChange={(e) =>
                      updateContent("about", {
                        ...content.about,
                        philosophy: { ...content.about.philosophy, quote: e.target.value },
                      })
                    }
                    placeholder="Quote text..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 8. CLIENTS & MARQUEE TAB */}
          {/* ================================================================ */}
          {activeSection === "clients" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Clients & Trusted Logos</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage the brands, companies, and logos in the animated marquee carousel and project attribution ({content.clients.length} Total).
                  </p>
                </div>
                <button
                  onClick={handleAddClient}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Plus size={15} />
                  <span>Add Client</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {content.clients.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5 hover:border-white/20 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="relative w-14 h-14 rounded-2xl bg-white/5 p-2 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                        <Image src={c.logo} alt={c.name} fill unoptimized className="object-contain p-1" />
                      </div>
                      <button
                        onClick={() => handleDeleteClient(c.id, c.name)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title={`Delete client "${c.name}"`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Client Brand Name
                      </label>
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...content.clients];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateContent("clients", updated);
                        }}
                        placeholder="Client Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Logo URL or Upload
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={c.logo}
                          onChange={(e) => {
                            const updated = [...content.clients];
                            updated[idx] = { ...updated[idx], logo: e.target.value };
                            updateContent("clients", updated);
                          }}
                          placeholder="Logo URL or /companies/..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-gray-300 focus:outline-none"
                        />
                        <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-medium cursor-pointer border border-white/10 flex items-center gap-1.5 transition-colors">
                          <Upload size={13} />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e, (url) => {
                                const updated = [...content.clients];
                                updated[idx] = { ...updated[idx], logo: url };
                                updateContent("clients", updated);
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 9. SKILLS & WORKFLOW TAB (Technical Tools Add, Edit, Logo Preview) */}
          {/* ================================================================ */}
          {activeSection === "skills" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Skills, Software Tools & Workflow</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage technical editing software tools, live logos, specializations, and workflow timeline steps.
                  </p>
                </div>

                {/* Prominent Add Software Tool Button */}
                <button
                  onClick={handleAddTool}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 w-fit"
                >
                  <Plus size={16} />
                  <span>Add Software Tool</span>
                </button>
              </div>

              {/* Technical Software Tools Grid */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench size={18} className="text-blue-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Technical Software Tools ({content.skills.technicalSkills.length})
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">Live logo previews & instant image uploader</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {content.skills.technicalSkills.map((tool, idx) => (
                    <div
                      key={tool.name + idx}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-4 relative group"
                    >
                      {/* Top Bar: Live Logo Preview & Tool Name */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 group/img">
                          {tool.image_link ? (
                            <Image
                              src={tool.image_link}
                              alt={tool.name}
                              fill
                              unoptimized
                              className="object-contain p-1.5"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <ImageIcon className="text-gray-500" size={24} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                            Tool Name
                          </label>
                          <input
                            type="text"
                            value={tool.name}
                            onChange={(e) => {
                              const updated = [...content.skills.technicalSkills];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              updateContent("skills", {
                                ...content.skills,
                                technicalSkills: updated,
                              });
                            }}
                            placeholder="e.g. DaVinci Resolve"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteTool(idx, tool.name)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-colors cursor-pointer"
                          title={`Delete ${tool.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Logo Image URL & Upload Button */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Logo Image URL / Path (or Upload New)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tool.image_link}
                            onChange={(e) => {
                              const updated = [...content.skills.technicalSkills];
                              updated[idx] = { ...updated[idx], image_link: e.target.value };
                              updateContent("skills", {
                                ...content.skills,
                                technicalSkills: updated,
                              });
                            }}
                            placeholder="/skills/davinci.png or https://..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
                          />

                          <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-medium cursor-pointer flex items-center gap-1 transition-all">
                            <Upload size={13} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(e, (url) => {
                                  const updated = [...content.skills.technicalSkills];
                                  updated[idx] = { ...updated[idx], image_link: url };
                                  updateContent("skills", {
                                    ...content.skills,
                                    technicalSkills: updated,
                                  });
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Tool Description
                        </label>
                        <textarea
                          rows={2}
                          value={tool.description}
                          onChange={(e) => {
                            const updated = [...content.skills.technicalSkills];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            updateContent("skills", {
                              ...content.skills,
                              technicalSkills: updated,
                            });
                          }}
                          placeholder="Brief description of what you use this software for..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-gray-300 resize-none focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Dashed Add Another Tool Card */}
                  <button
                    onClick={handleAddTool}
                    className="p-8 rounded-2xl border-2 border-dashed border-white/15 hover:border-blue-500/50 bg-white/[0.01] hover:bg-blue-600/5 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-white cursor-pointer min-h-[220px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-md">
                      <Plus size={24} />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-sm block text-white">Add Another Software Tool</span>
                      <span className="text-xs text-gray-500">Add Blender, Cinema 4D, Audition, etc.</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Workflow Timeline Steps
                </h3>
                <div className="space-y-3">
                  {content.skills.workflow.map((step, idx) => (
                    <div
                      key={step.step}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                    >
                      <span className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {step.step}
                      </span>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const updated = [...content.skills.workflow];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          updateContent("skills", { ...content.skills, workflow: updated });
                        }}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white font-semibold flex-1"
                      />
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => {
                          const updated = [...content.skills.workflow];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          updateContent("skills", { ...content.skills, workflow: updated });
                        }}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 flex-2 w-full sm:w-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 10. CONTACT & INFO TAB */}
          {/* ================================================================ */}
          {activeSection === "contact" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Contact & Communication Details</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage your direct email, WhatsApp number & link, location, and selling points.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={content.contact.email}
                      onChange={(e) =>
                        updateContent("contact", { ...content.contact, email: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      WhatsApp Display Number
                    </label>
                    <input
                      type="text"
                      value={content.contact.whatsappNumber}
                      onChange={(e) =>
                        updateContent("contact", {
                          ...content.contact,
                          whatsappNumber: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      WhatsApp Direct URL (wa.me/...)
                    </label>
                    <input
                      type="text"
                      value={content.contact.whatsappLink}
                      onChange={(e) =>
                        updateContent("contact", {
                          ...content.contact,
                          whatsappLink: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Availability Status
                    </label>
                    <input
                      type="text"
                      value={content.contact.availability}
                      onChange={(e) =>
                        updateContent("contact", {
                          ...content.contact,
                          availability: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Location Description
                  </label>
                  <input
                    type="text"
                    value={content.contact.location}
                    onChange={(e) =>
                      updateContent("contact", { ...content.contact, location: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 11. SEO & SETTINGS TAB */}
          {/* ================================================================ */}
          {activeSection === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">SEO, Security & Global Settings</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage search engine metadata, admin login credentials (ENV), and footer details.
                </p>
              </div>

              {/* Admin Security & Credentials Manager */}
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-blue-950/30 to-indigo-950/20 border border-blue-500/20 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Admin Security & Login Credentials (ENV)
                  </h3>
                </div>
                <p className="text-xs text-gray-300">
                  Current active username is fetched dynamically from your <code className="text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded font-mono">.env.local</code> file: <strong className="text-white">{currentAdminUsername}</strong>.
                  You can change your credentials here or directly edit <code className="text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded font-mono">.env.local</code>.
                </p>

                <form onSubmit={handleUpdateCredentials} className="space-y-4 pt-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Admin Username
                      </label>
                      <div className="relative">
                        <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={newUsernameInput}
                          onChange={(e) => setNewUsernameInput(e.target.value)}
                          placeholder="Admin Username"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        New Password (leave blank to keep unchanged)
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="New password (min 6 characters)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 max-w-sm">
                      <label className="block text-xs font-semibold text-amber-300 mb-1">
                        Current Password (Required to confirm changes) *
                      </label>
                      <input
                        type="password"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="w-full bg-white/5 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingCreds}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 sm:self-end h-10"
                    >
                      {isUpdatingCreds ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          <span>Update Credentials in ENV</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SEO Metadata */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">SEO Metadata</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Default Page Title
                  </label>
                  <input
                    type="text"
                    value={content.general.siteTitle}
                    onChange={(e) =>
                      updateContent("general", { ...content.general, siteTitle: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={content.general.siteDescription}
                    onChange={(e) =>
                      updateContent("general", {
                        ...content.general,
                        siteDescription: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Canonical Website URL
                  </label>
                  <input
                    type="text"
                    value={content.general.siteUrl}
                    onChange={(e) =>
                      updateContent("general", { ...content.general, siteUrl: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Footer Settings */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Footer & Attribution
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Footer Brand Name
                    </label>
                    <input
                      type="text"
                      value={content.footer.brandName}
                      onChange={(e) =>
                        updateContent("footer", { ...content.footer, brandName: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Copyright Name
                    </label>
                    <input
                      type="text"
                      value={content.footer.copyrightName}
                      onChange={(e) =>
                        updateContent("footer", { ...content.footer, copyrightName: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Footer Bio
                  </label>
                  <textarea
                    rows={2}
                    value={content.footer.brandBio}
                    onChange={(e) =>
                      updateContent("footer", { ...content.footer, brandBio: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSaveProject}
        availableCategories={content.categories}
        availableClients={content.clients}
        onAddNewClient={handleAddNewClientDirectly}
        onDeleteClient={handleDeleteClient}
      />
    </div>
  );
}
