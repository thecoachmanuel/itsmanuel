import { getSiteContent } from "@/lib/content-store";
import SkillsContentClient from "./skills-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function SkillsPage() {
  const siteContent = await getSiteContent(true);

  return (
    <SkillsContentClient
      skills={siteContent.skills}
      cta={siteContent.ctaDefaults}
    />
  );
}
