import { getSiteContent } from "@/lib/content-store";
import AboutContentClient from "./about-client";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const siteContent = await getSiteContent();

  return (
    <AboutContentClient
      about={siteContent.about}
      clients={siteContent.clients}
      cta={siteContent.ctaDefaults}
    />
  );
}
