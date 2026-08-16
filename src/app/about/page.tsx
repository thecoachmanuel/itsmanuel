import { getSiteContent } from "@/lib/content-store";
import AboutContentClient from "./about-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AboutPage() {
  const siteContent = await getSiteContent(true);

  return (
    <AboutContentClient
      about={siteContent.about}
      clients={siteContent.clients}
      cta={siteContent.ctaDefaults}
    />
  );
}
