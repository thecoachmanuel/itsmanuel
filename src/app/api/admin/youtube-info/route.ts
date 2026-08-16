import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Direct 11 char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Shorts: /shorts/ID
  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // YouTu.be: youtu.be/ID
  const youtuBeMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch) return youtuBeMatch[1];

  // Watch URL: ?v=ID or &v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Embed: /embed/ID
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Live: /live/ID
  const liveMatch = trimmed.match(/(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  // Generic fallback
  const genericMatch = trimmed.match(/(?:v\/|watch\?v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (genericMatch) return genericMatch[1];

  return null;
}

function parseIsoDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatSecondsToDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds)) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, videoId: directId } = body;

    const targetUrl = (url || directId || "").trim();
    const videoId = extractYouTubeId(targetUrl);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL or Video ID" },
        { status: 400 }
      );
    }

    let title = "";
    let description = "";
    let channelTitle = "";
    let duration = "";
    let publishDate = new Date().toISOString().split("T")[0];
    let tags: string[] = [];

    // 1. Fetch oEmbed metadata (high reliability for title & author)
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          next: { revalidate: 0 },
        }
      );
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.title) title = decodeHtmlEntities(oembedData.title);
        if (oembedData.author_name) channelTitle = decodeHtmlEntities(oembedData.author_name);
      }
    } catch (e) {
      console.warn("YouTube oEmbed fetch notice:", e);
    }

    // 2. Fetch watch page HTML for description, duration, tags, publish date
    try {
      const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 0 },
      });

      if (watchRes.ok) {
        const html = await watchRes.text();

        // Extract title if not already found
        if (!title) {
          const titleMatch =
            html.match(/<meta\s+name="title"\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) ||
            html.match(/<title>([^<]*)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            title = decodeHtmlEntities(titleMatch[1].replace(/ - YouTube$/, "").trim());
          }
        }

        // Extract description
        const descMatch =
          html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) ||
          html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
        if (descMatch && descMatch[1]) {
          description = decodeHtmlEntities(descMatch[1].trim());
        }

        // Extract duration
        const durationMatch = html.match(/<meta\s+itemprop="duration"\s+content="([^"]*)"/i);
        if (durationMatch && durationMatch[1]) {
          duration = parseIsoDuration(durationMatch[1]);
        }

        // Extract publish date
        const dateMatch =
          html.match(/<meta\s+itemprop="datePublished"\s+content="([^"]*)"/i) ||
          html.match(/<meta\s+itemprop="uploadDate"\s+content="([^"]*)"/i);
        if (dateMatch && dateMatch[1]) {
          publishDate = dateMatch[1].split("T")[0];
        }

        // Extract tags/keywords
        const keywordsMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]*)"/i);
        if (keywordsMatch && keywordsMatch[1]) {
          tags = keywordsMatch[1]
            .split(",")
            .map((t) => decodeHtmlEntities(t.trim()))
            .filter((t) => t.length > 0 && t.toLowerCase() !== "youtube" && t.length < 40)
            .slice(0, 8);
        }

        // Check ytInitialPlayerResponse in script tags for richer details
        const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({[\s\S]+?});(?:var|<\/script>)/);
        if (playerResponseMatch && playerResponseMatch[1]) {
          try {
            const playerResponse = JSON.parse(playerResponseMatch[1]);
            const details = playerResponse.videoDetails;
            if (details) {
              if (!title && details.title) title = details.title;
              if (!description && details.shortDescription) description = details.shortDescription;
              if (!channelTitle && details.author) channelTitle = details.author;
              if (!duration && details.lengthSeconds) {
                duration = formatSecondsToDuration(parseInt(details.lengthSeconds, 10));
              }
              if (tags.length === 0 && Array.isArray(details.keywords)) {
                tags = details.keywords.slice(0, 8);
              }
            }
          } catch {
            // Ignore JSON parse error on ytInitialPlayerResponse
          }
        }
      }
    } catch (e) {
      console.warn("YouTube page scrape notice:", e);
    }

    // Canonical link format
    const canonicalLink = `https://youtu.be/${videoId}`;

    return NextResponse.json({
      success: true,
      videoId,
      id: videoId,
      video_title: title || `YouTube Video (${videoId})`,
      video_description: description,
      client_name: channelTitle,
      duration: duration || "5:00",
      publish_date: publishDate,
      tags: tags.length > 0 ? tags : ["Video Editing"],
      cover_image: videoId,
      video_link: canonicalLink,
    });
  } catch (error) {
    console.error("Failed to fetch YouTube info:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube video metadata" },
      { status: 500 }
    );
  }
}
