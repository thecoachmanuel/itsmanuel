"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Check,
  Loader2,
  ExternalLink,
  Youtube,
  Sparkles,
  Building2,
  Clock,
  Layers,
  Filter,
} from "lucide-react";
import { VideoProject } from "@/types/videos";
import { ResumeProject } from "@/types/resume";
import { mapVideoProjectToResumeProject } from "@/lib/project-sync";
import Image from "next/image";
import { toast } from "sonner";

interface ProjectSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProjects: (syncedProjects: ResumeProject[], append: boolean) => void;
}

export default function ProjectSyncModal({
  isOpen,
  onClose,
  onApplyProjects,
}: ProjectSyncModalProps) {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkFormat, setLinkFormat] = useState<"youtube" | "portfolio">("youtube");
  const [appendMode, setAppendMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch("/api/admin/content")
        .then((res) => res.json())
        .then((data) => {
          if (data.content?.projects) {
            const list: VideoProject[] = data.content.projects;
            setProjects(list);
            // Default select all projects
            setSelectedIds(list.map((p) => p.id));
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch MongoDB projects:", err);
          toast.error("Could not load projects from database");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(projects.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const handleApply = () => {
    const selectedProjects = projects.filter((p) => selectedIds.includes(p.id));
    if (selectedProjects.length === 0) {
      toast.error("Please select at least one project to sync");
      return;
    }

    const mapped = selectedProjects.map((p) =>
      mapVideoProjectToResumeProject(p, { linkFormat })
    );

    onApplyProjects(mapped, appendMode);
    toast.success(
      `✨ Synced ${mapped.length} projects with ${linkFormat === "youtube" ? "YouTube" : "Portfolio"} links to resume!`
    );
    onClose();
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.video_title?.toLowerCase().includes(q) ||
      p.client_name?.toLowerCase().includes(q) ||
      p.category?.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090e1a] border border-white/15 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Sync MongoDB Projects to Resume
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
                  MongoDB Live
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Update Key Projects, Client Deliverables & video links directly from your portfolio database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sync Settings Options Bar */}
        <div className="p-4 sm:px-6 bg-white/[0.01] border-b border-white/5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Link Preference */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                Video Link Format in Resume:
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setLinkFormat("youtube")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    linkFormat === "youtube"
                      ? "bg-red-600/30 text-red-300 border border-red-500/40 shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Youtube size={13} />
                  <span>Direct YouTube</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLinkFormat("portfolio")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    linkFormat === "portfolio"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ExternalLink size={13} />
                  <span>Portfolio URL</span>
                </button>
              </div>
            </div>

            {/* Merge Preference */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                Import Behavior:
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setAppendMode(false)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    !appendMode
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Replace Existing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppendMode(true)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    appendMode
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Append to List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Bulk Select Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, client, or category..."
              className="w-full sm:w-72 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 text-[11px]">
                {selectedIds.length} of {projects.length} Selected
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer text-[11px]"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer text-[11px]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Project Selection List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <p className="text-xs text-gray-400">Loading portfolio projects from MongoDB...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No matching projects found in database.
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              const ytUrl = p.video_link || `https://youtu.be/${p.id}`;

              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5 cursor-pointer ${
                    isSelected
                      ? "bg-blue-950/20 border-blue-500/50 shadow-md shadow-blue-950/20"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20 opacity-70"
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "border-white/20 bg-white/5"
                    }`}
                  >
                    {isSelected && <Check size={13} />}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
                    <Image
                      src={`https://img.youtube.com/vi/${p.cover_image || p.id}/mqdefault.jpg`}
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

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white truncate">
                        {p.video_title}
                      </h4>
                      {p.category &&
                        p.category.map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300 font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      {p.client_name && (
                        <span className="flex items-center gap-1 text-blue-300 font-medium">
                          <Building2 size={11} />
                          {p.client_name}
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-gray-400 font-mono text-[10px]">
                        <Youtube size={11} className="text-red-400" />
                        {ytUrl}
                      </span>
                    </div>

                    {p.video_description && (
                      <p className="text-[11px] text-gray-400 line-clamp-1">
                        {p.video_description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={selectedIds.length === 0}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>Sync {selectedIds.length} Projects to ATS Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
}
