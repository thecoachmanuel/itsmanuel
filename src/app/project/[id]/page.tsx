import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectById } from "@/lib/content-store";
import ProjectDetails from "@/components/project-details";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Generate metadata dynamically for each project
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.video_title,
    description: project.video_description,
    openGraph: {
      title: project.video_title,
      description: project.video_description,
      images: [
        {
          url: `https://img.youtube.com/vi/${project.cover_image}/maxresdefault.jpg`,
          width: 1280,
          height: 720,
          alt: project.video_title,
        },
      ],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetails project={project} />;
}
