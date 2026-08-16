import { revalidatePath } from "next/cache";
import { getDb } from "./mongodb";
import { SiteContent, ContactMessage } from "@/types/content";
import { initialSiteContent } from "./seed-data";
import { VideoProject, Client } from "@/types/videos";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

const COLLECTION_NAME = "site_content";
const MESSAGES_COLLECTION = "contact_messages";
const MAIN_DOC_ID = "main_content";
const BACKUP_FILE_PATH = path.join(process.cwd(), "data", "content-backup.json");
const MESSAGES_BACKUP_PATH = path.join(process.cwd(), "data", "contact-messages.json");

// In-memory cache for ultra-fast server responses
let cachedContent: SiteContent | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache in memory

async function readLocalBackup(): Promise<SiteContent | null> {
  try {
    const data = await fs.readFile(BACKUP_FILE_PATH, "utf-8");
    return JSON.parse(data) as SiteContent;
  } catch {
    return null;
  }
}

async function writeLocalBackup(content: SiteContent): Promise<void> {
  try {
    const dir = path.dirname(BACKUP_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(BACKUP_FILE_PATH, JSON.stringify(content, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write local backup file:", error);
  }
}

// Local messages backup helpers
async function readLocalMessages(): Promise<ContactMessage[]> {
  try {
    const data = await fs.readFile(MESSAGES_BACKUP_PATH, "utf-8");
    const parsed = JSON.parse(data) as ContactMessage[];
    return parsed.map((m) => ({
      ...m,
      _id: m._id || m.id || `msg-${Date.now()}`,
      id: m._id || m.id || `msg-${Date.now()}`,
    }));
  } catch {
    return [];
  }
}

async function writeLocalMessages(messages: ContactMessage[]): Promise<void> {
  try {
    const dir = path.dirname(MESSAGES_BACKUP_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(MESSAGES_BACKUP_PATH, JSON.stringify(messages, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write local messages backup:", error);
  }
}

// Deep merge to ensure all nested properties exist even if schema evolves
function mergeWithDefaults(dbContent: Partial<SiteContent>): SiteContent {
  return {
    ...initialSiteContent,
    ...dbContent,
    general: { ...initialSiteContent.general, ...(dbContent.general || {}) },
    hero: { ...initialSiteContent.hero, ...(dbContent.hero || {}) },
    servicesSection: {
      ...initialSiteContent.servicesSection,
      ...(dbContent.servicesSection || {}),
      services: dbContent.servicesSection?.services || initialSiteContent.servicesSection.services,
    },
    projectsSection: {
      ...initialSiteContent.projectsSection,
      ...(dbContent.projectsSection || {}),
    },
    projects: dbContent.projects || initialSiteContent.projects,
    categories: dbContent.categories || initialSiteContent.categories,
    about: {
      ...initialSiteContent.about,
      ...(dbContent.about || {}),
      profile: { ...initialSiteContent.about.profile, ...(dbContent.about?.profile || {}) },
      stats: { ...initialSiteContent.about.stats, ...(dbContent.about?.stats || {}) },
      globalReach: { ...initialSiteContent.about.globalReach, ...(dbContent.about?.globalReach || {}) },
      philosophy: { ...initialSiteContent.about.philosophy, ...(dbContent.about?.philosophy || {}) },
      socials: dbContent.about?.socials || initialSiteContent.about.socials,
    },
    clients: dbContent.clients || initialSiteContent.clients,
    skills: {
      ...initialSiteContent.skills,
      ...(dbContent.skills || {}),
      technicalSkills: dbContent.skills?.technicalSkills || initialSiteContent.skills.technicalSkills,
      specializations: dbContent.skills?.specializations || initialSiteContent.skills.specializations,
      achievements: dbContent.skills?.achievements || initialSiteContent.skills.achievements,
      workflow: dbContent.skills?.workflow || initialSiteContent.skills.workflow,
    },
    contact: {
      ...initialSiteContent.contact,
      ...(dbContent.contact || {}),
      whyChooseMeItems: dbContent.contact?.whyChooseMeItems || initialSiteContent.contact.whyChooseMeItems,
    },
    footer: {
      ...initialSiteContent.footer,
      ...(dbContent.footer || {}),
      socialLinks: dbContent.footer?.socialLinks || initialSiteContent.footer.socialLinks,
    },
    ctaDefaults: {
      ...initialSiteContent.ctaDefaults,
      ...(dbContent.ctaDefaults || {}),
    },
  };
}

export async function getSiteContent(forceFresh = false): Promise<SiteContent> {
  const now = Date.now();
  if (!forceFresh && cachedContent && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedContent;
  }

  try {
    const db = await getDb();
    if (db) {
      const doc = await db.collection(COLLECTION_NAME).findOne({ _id: MAIN_DOC_ID as unknown as import("mongodb").ObjectId });
      if (doc) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...rest } = doc as unknown as SiteContent & { _id: unknown };
        const merged = mergeWithDefaults(rest);
        cachedContent = merged;
        lastCacheTime = now;
        return merged;
      }

      // If document doesn't exist yet, seed it into MongoDB
      console.log("Seeding MongoDB with initial site content...");
      const seed = { ...initialSiteContent, _id: MAIN_DOC_ID as unknown as import("mongodb").ObjectId, updatedAt: new Date().toISOString() };
      await db.collection(COLLECTION_NAME).insertOne(seed as unknown as import("mongodb").OptionalUnlessRequiredId<import("mongodb").Document>);
      cachedContent = initialSiteContent;
      lastCacheTime = now;
      await writeLocalBackup(initialSiteContent);
      return initialSiteContent;
    }
  } catch (error) {
    console.error("Error fetching site content from MongoDB, attempting local backup:", error);
  }

  // Fallback to local backup or initial default
  const localBackup = await readLocalBackup();
  const result = localBackup ? mergeWithDefaults(localBackup) : initialSiteContent;
  cachedContent = result;
  lastCacheTime = now;
  return result;
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const updatedData: SiteContent = {
    ...content,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...cleanData } = updatedData;
      await db.collection(COLLECTION_NAME).updateOne(
        { _id: MAIN_DOC_ID as unknown as import("mongodb").ObjectId },
        { $set: cleanData },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error("Failed to persist content to MongoDB:", error);
  }

  // Always write to local backup as safety layer
  await writeLocalBackup(updatedData);

  // Update in-memory cache immediately
  cachedContent = updatedData;
  lastCacheTime = Date.now();

  // Instant revalidation for all Next.js pages and layouts
  try {
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/about", "page");
    revalidatePath("/skills", "page");
    revalidatePath("/contact", "page");
    revalidatePath("/project/[id]", "page");
    if (updatedData.projects && Array.isArray(updatedData.projects)) {
      for (const p of updatedData.projects) {
        if (p.id) {
          revalidatePath(`/project/${p.id}`, "page");
        }
      }
    }
  } catch (e) {
    console.warn("revalidatePath notice:", e);
  }

  return updatedData;
}

export async function updateSiteContent(
  partialContent: Partial<SiteContent>
): Promise<SiteContent> {
  const current = await getSiteContent(true);
  const merged: SiteContent = {
    ...current,
    ...partialContent,
    general: partialContent.general ? { ...current.general, ...partialContent.general } : current.general,
    hero: partialContent.hero ? { ...current.hero, ...partialContent.hero } : current.hero,
    servicesSection: partialContent.servicesSection
      ? { ...current.servicesSection, ...partialContent.servicesSection }
      : current.servicesSection,
    projectsSection: partialContent.projectsSection
      ? { ...current.projectsSection, ...partialContent.projectsSection }
      : current.projectsSection,
    projects: partialContent.projects !== undefined ? partialContent.projects : current.projects,
    categories: partialContent.categories !== undefined ? partialContent.categories : current.categories,
    about: partialContent.about ? { ...current.about, ...partialContent.about } : current.about,
    clients: partialContent.clients !== undefined ? partialContent.clients : current.clients,
    skills: partialContent.skills ? { ...current.skills, ...partialContent.skills } : current.skills,
    contact: partialContent.contact ? { ...current.contact, ...partialContent.contact } : current.contact,
    footer: partialContent.footer ? { ...current.footer, ...partialContent.footer } : current.footer,
    ctaDefaults: partialContent.ctaDefaults
      ? { ...current.ctaDefaults, ...partialContent.ctaDefaults }
      : current.ctaDefaults,
  };

  return await saveSiteContent(merged);
}

// Project Specific CRUD Helpers
export async function getAllProjects(): Promise<VideoProject[]> {
  const content = await getSiteContent(true);
  return content.projects || [];
}

export async function getProjectById(id: string): Promise<VideoProject | undefined> {
  const projects = await getAllProjects();
  return projects.find((p) => p.id === id);
}

export async function getClients(): Promise<Client[]> {
  const content = await getSiteContent(true);
  return content.clients || [];
}

// ============================================================================
// CONTACT MESSAGES STORE (MongoDB + Local Backup)
// ============================================================================

export async function saveContactMessage(
  msg: Omit<ContactMessage, "createdAt" | "read" | "id">
): Promise<ContactMessage> {
  const generatedId = new ObjectId().toString();

  const newMessage: ContactMessage = {
    ...msg,
    _id: generatedId,
    id: generatedId,
    createdAt: new Date().toISOString(),
    read: false,
  };

  try {
    const db = await getDb();
    if (db) {
      const docToInsert = {
        ...newMessage,
        _id: new ObjectId(generatedId) as unknown as string,
      };
      await db.collection(MESSAGES_COLLECTION).insertOne(docToInsert as unknown as import("mongodb").OptionalUnlessRequiredId<import("mongodb").Document>);
    }
  } catch (error) {
    console.error("Failed to save contact message in MongoDB:", error);
  }

  // Always save to local messages backup
  const localList = await readLocalMessages();
  await writeLocalMessages([newMessage, ...localList]);

  return newMessage;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const db = await getDb();
    if (db) {
      const docs = await db
        .collection(MESSAGES_COLLECTION)
        .find()
        .sort({ createdAt: -1 })
        .toArray();

      if (docs && docs.length > 0) {
        return docs.map((doc) => ({
          _id: doc._id?.toString() || doc.id || "",
          id: doc._id?.toString() || doc.id || "",
          name: doc.name || "",
          email: doc.email || "",
          projectType: doc.projectType || "General",
          timeline: doc.timeline || "Flexible",
          message: doc.message || "",
          createdAt: doc.createdAt || new Date().toISOString(),
          read: !!doc.read,
          emailSent: doc.emailSent !== undefined ? doc.emailSent : true,
        }));
      }
    }
  } catch (error) {
    console.error("Error reading contact messages from MongoDB:", error);
  }

  return await readLocalMessages();
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  let deletedFromMongo = false;
  try {
    const db = await getDb();
    if (db) {
      let query: Record<string, unknown> = { _id: id };
      if (ObjectId.isValid(id)) {
        query = {
          $or: [
            { _id: new ObjectId(id) },
            { _id: id },
            { id: id }
          ]
        };
      } else {
        query = { $or: [{ _id: id }, { id: id }] };
      }
      const res = await db.collection(MESSAGES_COLLECTION).deleteOne(query);
      deletedFromMongo = res.deletedCount > 0;
    }
  } catch (error) {
    console.error("Failed to delete contact message from MongoDB:", error);
  }

  // Also delete from local backup
  const localList = await readLocalMessages();
  const filtered = localList.filter((m) => m._id !== id && m.id !== id);
  await writeLocalMessages(filtered);

  return deletedFromMongo || filtered.length < localList.length;
}

export async function markContactMessageRead(id: string, read = true): Promise<boolean> {
  try {
    const db = await getDb();
    if (db) {
      let query: Record<string, unknown> = { _id: id };
      if (ObjectId.isValid(id)) {
        query = {
          $or: [
            { _id: new ObjectId(id) },
            { _id: id },
            { id: id }
          ]
        };
      } else {
        query = { $or: [{ _id: id }, { id: id }] };
      }
      await db.collection(MESSAGES_COLLECTION).updateOne(query, { $set: { read } });
    }
  } catch (error) {
    console.error("Failed to update message read status in MongoDB:", error);
  }

  // Update local backup
  const localList = await readLocalMessages();
  const updated = localList.map((m) => (m._id === id || m.id === id ? { ...m, read } : m));
  await writeLocalMessages(updated);

  return true;
}

export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const db = await getDb();
    if (db) {
      const count = await db.collection(MESSAGES_COLLECTION).countDocuments({ read: false });
      if (count > 0) return count;
    }
  } catch {
    // Fallback to local
  }

  const localList = await readLocalMessages();
  return localList.filter((m) => !m.read).length;
}
