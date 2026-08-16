import { VideoProject } from "@/types/videos";
import { ResumeProject } from "@/types/resume";

export interface ProjectSyncOptions {
  linkFormat?: "youtube" | "portfolio";
  rolePrefix?: string;
  maxProjects?: number;
}

export function formatVideoUrl(project: VideoProject, linkFormat: "youtube" | "portfolio" = "youtube"): string {
  if (linkFormat === "portfolio") {
    return `https://www.itsmanuel.me/project/${project.id}`;
  }

  // YouTube format
  if (project.video_link && project.video_link.trim()) {
    const trimmed = project.video_link.trim();
    if (trimmed.startsWith("http")) return trimmed;
  }

  return `https://youtu.be/${project.id}`;
}

export function mapVideoProjectToResumeProject(
  project: VideoProject,
  options: ProjectSyncOptions = {}
): ResumeProject {
  const linkFormat = options.linkFormat || "youtube";
  const videoUrl = formatVideoUrl(project, linkFormat);

  const categoryText =
    project.category && project.category.length > 0 ? project.category.join(" & ") : "Video Production";

  const role = options.rolePrefix
    ? `${options.rolePrefix} (${categoryText})`
    : `Lead Video Editor & Producer (${categoryText})`;

  const tools =
    project.software_used && project.software_used.length > 0
      ? project.software_used
      : ["DaVinci Resolve Studio", "Adobe Premiere Pro", "After Effects"];

  const highlights: string[] = [];

  // Bullet 1: Client & Category delivery
  if (project.client_name) {
    highlights.push(
      `Produced and edited for client "${project.client_name}" with focus on high-retention ${categoryText.toLowerCase()} storytelling.`
    );
  } else {
    highlights.push(
      `Engineered end-to-end post-production workflow for high-engagement ${categoryText.toLowerCase()} content.`
    );
  }

  // Bullet 2: Duration, pacing & tools
  const durationText = project.duration ? ` (Duration: ${project.duration})` : "";
  highlights.push(
    `Directed visual rhythm, color grading, and audio mastering in ${tools.join(", ")}${durationText} to maximize audience retention.`
  );

  // Bullet 3: Client feedback or tags
  if (project.client_feedback && project.client_feedback.trim()) {
    highlights.push(`Client Review: "${project.client_feedback.trim()}"`);
  } else if (project.tags && project.tags.length > 0) {
    highlights.push(`Key Focus Areas & Deliverables: ${project.tags.join(", ")}.`);
  }

  return {
    id: `proj-${project.id}`,
    name: project.video_title || `Video Project (${project.id})`,
    role,
    tools,
    link: videoUrl,
    description: project.video_description || "High-retention video production with custom visual pacing and graphics.",
    highlights,
  };
}

export function mapAllVideoProjectsToResume(
  projects: VideoProject[],
  options: ProjectSyncOptions = {}
): ResumeProject[] {
  const mapped = projects.map((p) => mapVideoProjectToResumeProject(p, options));
  if (options.maxProjects && options.maxProjects > 0) {
    return mapped.slice(0, options.maxProjects);
  }
  return mapped;
}
