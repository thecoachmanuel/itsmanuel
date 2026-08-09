"use client";

import { useState, useEffect } from "react";
import { X, Youtube, Image as ImageIcon, Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { VideoProject } from "@/types/videos";
import Image from "next/image";
import { toast } from "sonner";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: VideoProject | null;
  onSave: (project: VideoProject) => void;
  availableCategories: string[];
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
  onSave,
  availableCategories,
}: ProjectModalProps) {
  const [formData, setFormData] = useState<VideoProject>({
    id: "",
    video_title: "",
    video_description: "",
    tags: [],
    cover_image: "",
    publish_date: new Date().toISOString().split("T")[0],
    client_name: "",
    client_image: "/companies/sl-logo.png",
    client_feedback: "",
    video_link: "",
    project_images: [],
    category: ["Explainer"],
    duration: "5:00",
    software_used: ["DaVinci Resolve"],
  });

  const [tagInput, setTagInput] = useState("");
  const [softwareInput, setSoftwareInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        tags: project.tags || [],
        category: project.category || ["Explainer"],
        project_images: project.project_images || [],
        software_used: project.software_used || ["DaVinci Resolve"],
      });
    } else {
      setFormData({
        id: "",
        video_title: "",
        video_description: "",
        tags: ["Video Editing"],
        cover_image: "",
        publish_date: new Date().toISOString().split("T")[0],
        client_name: "",
        client_image: "/companies/sl-logo.png",
        client_feedback: "",
        video_link: "",
        project_images: [],
        category: [availableCategories.find((c) => c !== "All") || "Explainer"],
        duration: "5:00",
        software_used: ["DaVinci Resolve"],
      });
    }
  }, [project, isOpen, availableCategories]);

  // Extract YouTube ID from link
  const handleVideoLinkChange = (url: string) => {
    let extractedId = "";
    if (url.includes("youtube.com/shorts/")) {
      const match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (match) extractedId = match[1];
    } else if (url.includes("youtu.be/")) {
      const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (match) extractedId = match[1];
    } else if (url.includes("watch?v=")) {
      const match = url.match(/v=([a-zA-Z0-9_-]{11})/);
      if (match) extractedId = match[1];
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      extractedId = url.trim();
    }

    setFormData((prev) => ({
      ...prev,
      video_link: url,
      cover_image: extractedId || prev.cover_image,
      id: prev.id || extractedId || `project-${Date.now()}`,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "client_image" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (targetField === "client_image") {
        setFormData((prev) => ({ ...prev, client_image: data.url }));
      } else {
        setFormData((prev) => ({
          ...prev,
          project_images: [...prev.project_images, data.url],
        }));
      }
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.category.includes(cat);
      if (exists) {
        if (prev.category.length === 1) return prev; // Keep at least one
        return { ...prev, category: prev.category.filter((c) => c !== cat) };
      } else {
        return { ...prev, category: [...prev.category, cat] };
      }
    });
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const addSoftware = () => {
    if (!softwareInput.trim()) return;
    if (!formData.software_used?.includes(softwareInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        software_used: [...(prev.software_used || []), softwareInput.trim()],
      }));
    }
    setSoftwareInput("");
  };

  const removeSoftware = (software: string) => {
    setFormData((prev) => ({
      ...prev,
      software_used: prev.software_used?.filter((s) => s !== software),
    }));
  };

  const addGalleryImage = () => {
    if (!galleryInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      project_images: [...prev.project_images, galleryInput.trim()],
    }));
    setGalleryInput("");
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      project_images: prev.project_images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video_title.trim()) {
      toast.error("Video title is required");
      return;
    }
    if (!formData.id.trim()) {
      toast.error("Project ID / Slug is required");
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090e1a] border border-white/15 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Youtube size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {project ? "Edit Video Project" : "Add New Video Project"}
              </h3>
              <p className="text-xs text-gray-400">
                Provide video details, category tags, client information & metadata
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {/* Top Row: Video URL & ID with Auto-Detection */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                YouTube Video Link or ID *
              </label>
              <input
                type="text"
                required
                value={formData.video_link}
                onChange={(e) => handleVideoLinkChange(e.target.value)}
                placeholder="https://youtu.be/... or YouTube Watch URL"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Paste any YouTube URL — thumbnail ID will auto-populate.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Project ID / Slug *
              </label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g. rVVeLdouViU or custom-slug"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Live Preview Bar */}
          {formData.cover_image && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
                <Image
                  src={`https://img.youtube.com/vi/${formData.cover_image}/maxresdefault.jpg`}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p className="text-white font-semibold">YouTube Thumbnail Detected</p>
                <p>Thumbnail Key: <code className="text-blue-300">{formData.cover_image}</code></p>
                <p>Auto-synced from YouTube high-resolution stream</p>
              </div>
            </div>
          )}

          {/* Title & Duration */}
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Video Title *
              </label>
              <input
                type="text"
                required
                value={formData.video_title}
                onChange={(e) => setFormData({ ...formData, video_title: e.target.value })}
                placeholder="e.g. Mastering DSA for Developers"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration || ""}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 8:15"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Video Description
            </label>
            <textarea
              rows={3}
              value={formData.video_description}
              onChange={(e) => setFormData({ ...formData, video_description: e.target.value })}
              placeholder="Describe the storytelling, pacing, and visual style of this video..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </div>

          {/* Categories Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Categories (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories
                .filter((c) => c !== "All")
                .map((cat) => {
                  const selected = formData.category.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50"
                          : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {cat}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Client Details Row */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Client & Testimonial Info
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Client / Channel Name
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g. GrowthLeo LLC or Stack Learner"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Client Logo Path / URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.client_image}
                    onChange={(e) => setFormData({ ...formData, client_image: e.target.value })}
                    placeholder="/companies/sl-logo.png"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-medium cursor-pointer border border-white/10 flex items-center gap-1.5">
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "client_image")}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Client Testimonial / Feedback (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.client_feedback || ""}
                onChange={(e) => setFormData({ ...formData, client_feedback: e.target.value })}
                placeholder="What did the client say about this project?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>
          </div>

          {/* Software Used & Tags */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Software */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Software Used
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={softwareInput}
                  onChange={(e) => setSoftwareInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSoftware())}
                  placeholder="e.g. DaVinci Resolve, After Effects"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSoftware}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.software_used?.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300"
                  >
                    {s}
                    <button type="button" onClick={() => removeSoftware(s)} className="hover:text-red-400">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                SEO & Project Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300"
                  >
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Project Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Additional Gallery Images
              </label>
              <label className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
                <Upload size={12} />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "gallery")}
                />
              </label>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGalleryImage())}
                placeholder="Or paste image URL"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addGalleryImage}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>

            {formData.project_images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {formData.project_images.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/10 group">
                    <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            {project ? "Update Project" : "Add Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
