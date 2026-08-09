import { SiteContent } from "@/types/content";
import { allVideoProjects } from "@/db/projects";
import { clientsData } from "@/db/clients";
import { categories } from "@/db/categories";
import {
  videoEditingSkills,
  specializations,
  achievements,
  workflow,
} from "@/db/skills";

export const initialSiteContent: SiteContent = {
  general: {
    siteTitle: "Emmanuel Olaitan – Video Editor & Motion Graphics Designer",
    siteTemplateTitle: "%s | Emmanuel Olaitan",
    siteDescription:
      "Turning raw footage into visual stories — with style, precision, and a touch of cinematic magic. Emmanuel Olaitan specializes in DaVinci Resolve, Premiere Pro, and After Effects — delivering cinematic edits, motion graphics, and polished storytelling.",
    keywords: [
      "Emmanuel Olaitan",
      "Video Editor",
      "Motion Graphics Designer",
      "DaVinci Resolve",
      "Premiere Pro",
      "After Effects",
      "Color Grading",
      "YouTube Video Editing",
      "Course Video Editing",
      "Logo Animation",
      "Visual Storytelling",
      "Freelance Video Editor",
      "Cinematic Editing",
      "Content Creator",
      "Lower Thirds",
      "Audio Sync",
    ],
    authorName: "Emmanuel Olaitan",
    authorUrl: "https://www.itsmanuel.me",
    siteUrl: "https://itsmanuel.vercel.app",
    ogImage: "/itsmanuel.jpg",
    twitterHandle: "@itsmanuel",
  },
  hero: {
    badgeText: "Available for Hire",
    titleLine1: "CINEMATIC",
    titleLine2: "EDITOR",
    subtitle:
      "Turning raw footage into visual stories — with style, precision, and a touch of",
    subtitleHighlight: "cinematic magic",
    primaryCtaText: "View Work",
    primaryCtaLink: "#projects",
    secondaryCtaText: "Contact Me",
    secondaryCtaLink: "/contact",
    scrollText: "Scroll",
  },
  servicesSection: {
    title: "What I Can Do",
    titleHighlight: "for You",
    subtitle:
      "If you're looking for someone who blends creativity with technical skill, communicates clearly, and truly cares about results.",
    services: [
      {
        id: "youtube-editing",
        title: "YouTube Editing",
        description: "Engaging edits optimized for retention with perfect pacing.",
        icon: "🎬",
      },
      {
        id: "course-content",
        title: "Course Content",
        description: "Clear, educational content with professional polish.",
        icon: "📚",
      },
      {
        id: "motion-graphics",
        title: "Motion Graphics",
        description: "Eye-catching animations that enhance your storytelling.",
        icon: "🌀",
      },
      {
        id: "color-grading",
        title: "Color Grading",
        description: "Cinematic looks that give your videos a premium feel.",
        icon: "🎨",
      },
      {
        id: "logo-animation",
        title: "Logo Animation",
        description: "Professional branding elements that stand out.",
        icon: "🏷️",
      },
      {
        id: "audio-engineering",
        title: "Audio Engineering",
        description: "Crystal clear audio mix with noise reduction.",
        icon: "🎵",
      },
    ],
  },
  projectsSection: {
    title: "My Video Projects",
    titleHighlight: "powerful",
    subtitle:
      "From smooth transitions to precise audio syncing and dynamic animations — I focus on making your content not just polished, but",
    subtitleHighlight: "powerful",
  },
  projects: allVideoProjects,
  categories: categories,
  about: {
    pageTitle: "The Man Behind the",
    pageTitleHighlight: "Magic",
    pageSubtitle:
      "Visual Storyteller. Motion Graphics Artist. Problem Solver.",
    profile: {
      firstName: "EMMANUEL",
      lastName: "OLAITAN",
      title: "Professional Video Editor & Motion Designer",
      image: "/itsmanuel.jpg",
    },
    stats: {
      number: "5+",
      label: "Years Active",
      description: "Years of professional grinding.",
    },
    globalReach: {
      title: "Global Reach",
      badge: "WORLDWIDE",
      description: "Remote ready.",
    },
    philosophy: {
      title: "Philosophy",
      quote:
        "I don't just cut footage; I construct feelings. Every frame must earn its place on the timeline, serving the narrative above all else.",
      description: "Story is King.",
    },
    socials: [
      {
        name: "LinkedIn",
        href: "https://linkedin.com/in/emmanuel-olaitan",
        icon: "Linkedin",
      },
      {
        name: "Instagram",
        href: "https://instagram.com/editbymanuel",
        icon: "Instagram",
      },
      {
        name: "YouTube",
        href: "https://youtube.com/@thecoachmanuel",
        icon: "Youtube",
      },
    ],
    trustedClientsTitle: "Trusted By",
  },
  clients: clientsData,
  skills: {
    heroTitle: "My Skills & Expertise",
    heroSubtitle:
      "With years of experience in video editing and motion graphics, I bring technical expertise and creative vision to every project. Here's what I can do for you.",
    technicalSkillsTitle: "Technical Skills",
    specializationsTitle: "Specializations",
    achievementsTitle: "Achievements",
    workflowTitle: "My Workflow",
    technicalSkills: videoEditingSkills.map((s) => ({
      name: s.name,
      image_link: s.image_link,
      description: s.description,
      color: s.color,
    })),
    specializations: specializations,
    achievements: achievements.map((a) => ({
      title: a.title,
      description: a.description,
      icon: a.icon.name || "Award",
      color: a.color,
    })),
    workflow: workflow,
  },
  contact: {
    heroTitle: "Get In Touch",
    heroSubtitle:
      "Have a project in mind or want to collaborate? I'd love to hear from you. Let's create something amazing together!",
    infoTitle: "Contact Information",
    email: "olaitanadewale@gmail.com",
    whatsappNumber: "+234 (816) 888-2014",
    whatsappLink: "https://wa.me/+2348168882014",
    location: "Available Worldwide (Remote)",
    availability: "Flexible with time zones",
    whyChooseMeTitle: "Why Choose Me?",
    whyChooseMeItems: [
      {
        title: "Quick Turnaround",
        description: "Fast delivery without compromising quality",
        color: "blue",
      },
      {
        title: "Professional Quality",
        description: "Cinematic edits with attention to detail",
        color: "green",
      },
      {
        title: "Clear Communication",
        description: "Regular updates and transparent process",
        color: "purple",
      },
    ],
    formTitle: "Send Message",
    whatsappFooterNotice:
      "Prefer to chat directly? Reach out on WhatsApp for instant communication.",
  },
  footer: {
    brandName: "Emmanuel Olaitan",
    brandBio:
      "Video Editor and Motion Graphics Designer passionate about creating visual stories with style, precision, and cinematic magic.",
    quickLinksTitle: "Quick Links",
    connectTitle: "Connect With Me",
    copyrightName: "Coach Manuel",
    copyrightUrl: "https://instagram.com/thecoachmanuel",
    socialLinks: [
      {
        name: "YouTube",
        href: "https://www.youtube.com/@iamcoachmanuel",
        icon: "Youtube",
      },
      {
        name: "Instagram",
        href: "https://instagram.com/editbymanuel",
        icon: "Instagram",
      },
      {
        name: "LinkedIn",
        href: "https://linkedin.com/in/emmanuel-olaitan",
        icon: "Linkedin",
      },
      {
        name: "Twitter",
        href: "https://twitter.com",
        icon: "Twitter",
      },
      {
        name: "Email",
        href: "mailto:olaitanadewale@gmail.com",
        icon: "Mail",
      },
    ],
  },
  ctaDefaults: {
    title: "Ready to create magic?",
    description:
      "Let's discuss your video editing needs and create something amazing together. I'm here to help bring your vision to life with professional quality and creative flair.",
    buttonText: "Start Your Project",
    href: "/contact",
  },
};
