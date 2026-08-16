import { clientsData } from "@/db/clients";
import { allVideoProjects } from "@/db/projects";
import { Client, VideoProject } from "@/types/videos";

// Helper function to get all projects sorted by date (latest first)
export const getAllVideoProjects = (projects: VideoProject[] = allVideoProjects): VideoProject[] => {
  return [...projects].sort(
    (a, b) =>
      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  );
};

export const getAllVideoProjectsFlattened = (projects: VideoProject[] = allVideoProjects): VideoProject[] => {
  return getAllVideoProjects(projects);
};

// Helper function to get projects by category sorted by date (latest first)
export const getVideoProjectsByCategory = (
  category: string,
  projects: VideoProject[] = allVideoProjects
): VideoProject[] => {
  if (category === "All") {
    return getAllVideoProjects(projects);
  }

  const filteredProjects = projects.filter((project) =>
    project.category.includes(category)
  );

  return filteredProjects.sort(
    (a, b) =>
      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  );
};

// Helper function to get project by ID
export const getVideoProjectById = (
  id: string,
  projects: VideoProject[] = allVideoProjects
): VideoProject | undefined => {
  return projects.find((project) => project.id === id);
};

// Helper function to get all unique categories
export const getVideoCategories = (projects: VideoProject[] = allVideoProjects): string[] => {
  const categoriesSet = new Set<string>();

  projects.forEach((project) => {
    project.category.forEach((cat) => categoriesSet.add(cat));
  });

  return Array.from(categoriesSet);
};

// Returns categories with project count, sorted descending
export const getVideoCategoriesWithCount = (
  projects: VideoProject[] = allVideoProjects
): {
  category: string;
  count: number;
}[] => {
  const categoryCountMap = new Map<string, number>();

  projects.forEach((project) => {
    project.category.forEach((cat) => {
      categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1);
    });
  });

  const sortedCategories = Array.from(categoryCountMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return sortedCategories;
};

export const getVideoCategoriesWithCountIncludingAll = (
  projects: VideoProject[] = allVideoProjects
): {
  category: string;
  count: number;
}[] => {
  const categoryCounts = getVideoCategoriesWithCount(projects);
  const total = projects.length;

  return [{ category: "All", count: total }, ...categoryCounts];
};

export function getFeaturedProjects(
  limit = 6,
  projects: VideoProject[] = allVideoProjects
): VideoProject[] {
  return getAllVideoProjects(projects).slice(0, limit);
}

export function getClients(clients: Client[] = clientsData): Client[] {
  return clients;
}

// Helper function to extract YouTube video ID from any link format
export const extractYouTubeId = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  const youtuBeMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch) return youtuBeMatch[1];

  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  const liveMatch = trimmed.match(/(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  const genericMatch = trimmed.match(/(?:v\/|watch\?v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (genericMatch) return genericMatch[1];

  return null;
};

// Helper function to get the proper embed link
export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};
