"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Youtube,
  Image as ImageIcon,
  Upload,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  Check,
  RefreshCw,
  Building2,
} from "lucide-react";
import { VideoProject, Client } from "@/types/videos";
import Image from "next/image";
import { toast } from "sonner";
import { extractYouTubeId } from "@/lib/helper";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: VideoProject | null;
  onSave: (project: VideoProject) => void;
  availableCategories: string[];
  availableClients?: Client[];
  onAddNewClient?: (client: Client) => Promise<void> | void;
  onDeleteClient?: (clientId: string, clientName?: string) => Promise<void> | void;
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
  onSave,
  availableCategories,
  availableClients = [],
  onAddNewClient,
  onDeleteClient,
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
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState("");

  // New client inline drawer state
  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientLogo, setNewClientLogo] = useState("/companies/sl-logo.png");
  const [isSavingClient, setIsSavingClient] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        tags: project.tags || [],
        category: project.category || ["Explainer"],
        project_images: project.project_images || [],
        software_used: project.software_used || ["DaVinci Resolve"],
      });
      setLastFetchedId(project.cover_image || project.id || "");
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
      setLastFetchedId("");
    }
    setShowNewClientDrawer(false);
    setNewClientName("");
    setNewClientLogo("/companies/sl-logo.png");
  }, [project, isOpen, availableCategories]);

  // Fetch YouTube Metadata
  const fetchYouTubeMetadata = useCallback(
    async (urlOrId: string, forceOverwrite = false) => {
      const extractedId = extractYouTubeId(urlOrId);
      if (!extractedId) {
        if (forceOverwrite) {
          toast.error("Please enter a valid YouTube video link first");
        }
        return;
      }

      setIsFetchingMeta(true);
      const toastId = forceOverwrite ? toast.loading("Fetching video metadata from YouTube...") : undefined;

      try {
        const res = await fetch("/api/admin/youtube-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlOrId, videoId: extractedId }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setFormData((prev) => {
            const shouldFillTitle =
              forceOverwrite ||
              !prev.video_title.trim() ||
              prev.video_title.startsWith("New Video");

            const shouldFillDesc = forceOverwrite || !prev.video_description.trim();
            const shouldFillClient = forceOverwrite || !prev.client_name.trim();
            const shouldFillDuration = forceOverwrite || !prev.duration || prev.duration === "5:00";
            const shouldFillDate = forceOverwrite || !prev.publish_date;

            const existingTags = prev.tags || [];
            const incomingTags = data.tags || [];
            const combinedTags = Array.from(new Set([...existingTags, ...incomingTags]));

            return {
              ...prev,
              // ALWAYS replace slug/id and cover_image with the extracted YouTube ID
              id: extractedId,
              cover_image: extractedId,
              video_link: prev.video_link || data.video_link,
              video_title: shouldFillTitle && data.video_title ? data.video_title : prev.video_title,
              video_description: shouldFillDesc && data.video_description ? data.video_description : prev.video_description,
              client_name: shouldFillClient && data.client_name ? data.client_name : prev.client_name,
              duration: shouldFillDuration && data.duration ? data.duration : prev.duration,
              publish_date: shouldFillDate && data.publish_date ? data.publish_date : prev.publish_date,
              tags: combinedTags.length > 0 ? combinedTags : prev.tags,
            };
          });

          setLastFetchedId(extractedId);

          if (toastId) {
            toast.success(`✨ Details loaded from YouTube! Slug set to "${extractedId}"`, { id: toastId });
          } else {
            toast.success(`✨ YouTube info auto-populated (Slug: ${extractedId})`);
          }
        } else {
          if (toastId) {
            toast.error(data.error || "Could not fetch YouTube metadata", { id: toastId });
          }
        }
      } catch (err) {
        console.warn("YouTube fetch error:", err);
        if (toastId) {
          toast.error("Failed to connect to YouTube metadata API", { id: toastId });
        }
      } finally {
        setIsFetchingMeta(false);
      }
    },
    []
  );

  // Extract YouTube ID from link, auto-replace slug, and auto-fetch metadata
  const handleVideoLinkChange = (url: string) => {
    const extractedId = extractYouTubeId(url);

    setFormData((prev) => ({
      ...prev,
      video_link: url,
      // ALWAYS replace slug/id with the extracted YouTube video ID when detected
      id: extractedId || prev.id,
      cover_image: extractedId || prev.cover_image,
    }));

    if (extractedId && extractedId !== lastFetchedId) {
      fetchYouTubeMetadata(url, false);
    }
  };

  const handleCreateAndSelectClient = async () => {
    if (!newClientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    setIsSavingClient(true);
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: newClientName.trim(),
      logo: newClientLogo.trim() || "/companies/sl-logo.png",
    };

    try {
      if (onAddNewClient) {
        await onAddNewClient(newClient);
      }
      setFormData((prev) => ({
        ...prev,
        client_name: newClient.name,
        client_image: newClient.logo,
      }));
      setShowNewClientDrawer(false);
      setNewClientName("");
      setNewClientLogo("/companies/sl-logo.png");
      toast.success(`Client "${newClient.name}" created and applied to project!`);
    } catch {
      toast.error("Failed to save new client");
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: "client_image" | "gallery" | "new_client_logo"
  ) => {
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
      } else if (targetField === "new_client_logo") {
        setNewClientLogo(data.url);
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
          {/* Top Row: Video URL & ID with Auto-Detection & Instant YouTube Sync */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  YouTube Video Link or ID *
                </label>
                <button
                  type="button"
                  onClick={() => fetchYouTubeMetadata(formData.video_link, true)}
                  disabled={isFetchingMeta || !formData.video_link}
                  className="text-[11px] text-blue-400 hover:text-blue-300 disabled:opacity-40 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  title="Auto-fetch and populate video title, description, channel name, duration & tags from YouTube"
                >
                  {isFetchingMeta ? (
                    <Loader2 size={12} className="animate-spin text-blue-400" />
                  ) : (
                    <Sparkles size={12} className="text-amber-400" />
                  )}
                  <span>{isFetchingMeta ? "Fetching..." : "Auto-Fill from YouTube"}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.video_link}
                  onChange={(e) => handleVideoLinkChange(e.target.value)}
                  placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 pr-10"
                />
                {isFetchingMeta && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Paste any YouTube URL — auto-replaces slug, thumbnail, title & description!
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Project ID / URL Slug *
                </label>
                {formData.id && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <Check size={10} /> Auto-synced
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g. rVVeLdouViU or custom-slug"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Slug updates automatically to match the YouTube video ID.
              </p>
            </div>
          </div>

          {/* Live YouTube Preview Card */}
          {formData.cover_image && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-blue-500/20 shadow-lg shadow-blue-950/20 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-44 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0 shadow-md">
                <Image
                  src={`https://img.youtube.com/vi/${formData.cover_image}/maxresdefault.jpg`}
                  alt="Thumbnail preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
                {formData.duration && (
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">
                    {formData.duration}
                  </span>
                )}
              </div>

              <div className="flex-1 w-full text-xs text-gray-400 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold text-[11px]">
                      <Youtube size={12} className="text-red-400" />
                      YouTube Connected
                    </span>
                    <code className="text-gray-300 font-mono bg-white/5 px-2 py-0.5 rounded">
                      ID: {formData.cover_image}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchYouTubeMetadata(formData.video_link || formData.cover_image, true)}
                      disabled={isFetchingMeta}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      <RefreshCw size={11} className={isFetchingMeta ? "animate-spin" : ""} />
                      <span>Refresh Info</span>
                    </button>

                    {formData.video_link && (
                      <a
                        href={formData.video_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <ExternalLink size={11} />
                        <span>Watch</span>
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-white font-medium text-sm line-clamp-1">
                  {formData.video_title || "Untitled Video"}
                </p>
                <p className="text-gray-400 text-[11px]">
                  {formData.client_name ? `Channel / Client: ${formData.client_name} • ` : ""}
                  Published: {formData.publish_date}
                </p>
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

          {/* Client Details & Selector Row */}
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Building2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Client & Brand Attribution
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Pick a trusted client brand or enter custom attribution details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewClientDrawer(!showNewClientDrawer)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
              >
                <Plus size={13} />
                <span>{showNewClientDrawer ? "Close Form" : "Create New Client"}</span>
              </button>
            </div>

            {/* Visual Client Picker Grid */}
            {availableClients && availableClients.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-gray-300">
                    Select Client Logo & Name:
                  </label>
                  {formData.client_name && (
                    <span className="text-[11px] text-blue-400 font-medium">
                      Active: <strong className="text-white">{formData.client_name}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto custom-scrollbar p-1">
                  {availableClients.map((client) => {
                    const isSelected =
                      (formData.client_name &&
                        formData.client_name.toLowerCase().trim() === client.name.toLowerCase().trim()) ||
                      (formData.client_image && formData.client_image === client.logo);

                    return (
                      <div
                        key={client.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            client_name: client.name,
                            client_image: client.logo,
                          }));
                          toast.success(`Selected client "${client.name}"`);
                        }}
                        className={`group relative p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500/70 shadow-lg shadow-blue-900/30 text-white"
                            : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] text-gray-300"
                        }`}
                      >
                        <div className="relative w-8 h-8 rounded-xl bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                          <Image
                            src={client.logo || "/placeholder.svg"}
                            alt={client.name}
                            fill
                            unoptimized
                            className="object-contain p-0.5"
                          />
                        </div>
                        <span className="text-xs font-semibold truncate flex-1">{client.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Check size={10} />
                          </div>
                        )}
                        {onDeleteClient && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClient(client.id, client.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded transition-all ml-auto cursor-pointer"
                            title={`Remove client "${client.name}"`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inline New Client Creator Drawer */}
            {showNewClientDrawer && (
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Building2 size={14} />
                    Create New Client / Brand
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowNewClientDrawer(false)}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="e.g. Netflix or Stack Learner"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Client Logo Path / URL *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newClientLogo}
                        onChange={(e) => setNewClientLogo(e.target.value)}
                        placeholder="/companies/logo.png"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                      <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-medium cursor-pointer border border-white/10 flex items-center gap-1">
                        {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "new_client_logo")}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewClientDrawer(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAndSelectClient}
                    disabled={isSavingClient || !newClientName.trim()}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingClient ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    <span>Save & Select Client</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Client Fields / Manual Override */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
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
                  <div className="relative w-9 h-9 rounded-xl bg-white/5 p-1 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                    <Image
                      src={formData.client_image || "/placeholder.svg"}
                      alt="Logo preview"
                      fill
                      unoptimized
                      className="object-contain p-0.5"
                    />
                  </div>
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
