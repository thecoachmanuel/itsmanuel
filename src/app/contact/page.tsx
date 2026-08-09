import { getSiteContent } from "@/lib/content-store";
import ContactContentClient from "./contact-client";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const siteContent = await getSiteContent();

  return <ContactContentClient contact={siteContent.contact} />;
}
