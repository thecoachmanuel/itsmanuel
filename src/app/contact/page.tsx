import { getSiteContent } from "@/lib/content-store";
import ContactContentClient from "./contact-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ContactPage() {
  const siteContent = await getSiteContent(true);

  return <ContactContentClient contact={siteContent.contact} />;
}
