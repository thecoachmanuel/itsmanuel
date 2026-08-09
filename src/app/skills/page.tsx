import { getSiteContent } from "@/lib/content-store";
import SkillsContentClient from "./skills-client";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const siteContent = await getSiteContent();

  return (
    <SkillsContentClient
      skills={siteContent.skills}
      cta={siteContent.ctaDefaults}
    />
  );
}
