import { VideoProject, Client } from "./videos";

export interface ContactMessage {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  projectType: string;
  timeline: string;
  message: string;
  createdAt: string;
  read: boolean;
  emailSent?: boolean;
}

export interface HeroContent {
  badgeText: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  subtitleHighlight: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  scrollText: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ServicesSectionContent {
  title: string;
  titleHighlight: string;
  subtitle: string;
  services: ServiceItem[];
}

export interface ProjectsSectionContent {
  title: string;
  titleHighlight: string;
  subtitle: string;
  subtitleHighlight: string;
}

export interface BentoSocial {
  name: string;
  href: string;
  icon: string;
}

export interface AboutContent {
  pageTitle: string;
  pageTitleHighlight: string;
  pageSubtitle: string;
  profile: {
    firstName: string;
    lastName: string;
    title: string;
    image: string;
  };
  stats: {
    number: string;
    label: string;
    description: string;
  };
  globalReach: {
    title: string;
    badge: string;
    description: string;
  };
  philosophy: {
    title: string;
    quote: string;
    description: string;
  };
  socials: BentoSocial[];
  trustedClientsTitle: string;
}

export interface TechnicalSkill {
  name: string;
  image_link: string;
  description: string;
  color: string;
}

export interface Specialization {
  title: string;
  skills: string[];
  icon: string;
  description: string;
}

export interface Achievement {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface SkillsContent {
  heroTitle: string;
  heroSubtitle: string;
  technicalSkillsTitle: string;
  specializationsTitle: string;
  achievementsTitle: string;
  workflowTitle: string;
  technicalSkills: TechnicalSkill[];
  specializations: Specialization[];
  achievements: Achievement[];
  workflow: WorkflowStep[];
}

export interface WhyChooseMeItem {
  title: string;
  description: string;
  color: string;
}

export interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  infoTitle: string;
  email: string;
  whatsappNumber: string;
  whatsappLink: string;
  location: string;
  availability: string;
  whyChooseMeTitle: string;
  whyChooseMeItems: WhyChooseMeItem[];
  formTitle: string;
  whatsappFooterNotice: string;
}

export interface GeneralSettings {
  siteTitle: string;
  siteTemplateTitle: string;
  siteDescription: string;
  keywords: string[];
  authorName: string;
  authorUrl: string;
  siteUrl: string;
  ogImage: string;
  twitterHandle: string;
}

export interface FooterSocialLink {
  name: string;
  href: string;
  icon: string;
}

export interface FooterContent {
  brandName: string;
  brandBio: string;
  quickLinksTitle: string;
  connectTitle: string;
  copyrightName: string;
  copyrightUrl: string;
  socialLinks: FooterSocialLink[];
}

export interface CTASectionContent {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export interface SiteContent {
  _id?: string;
  updatedAt?: string;
  general: GeneralSettings;
  hero: HeroContent;
  servicesSection: ServicesSectionContent;
  projectsSection: ProjectsSectionContent;
  projects: VideoProject[];
  categories: string[];
  about: AboutContent;
  clients: Client[];
  skills: SkillsContent;
  contact: ContactContent;
  footer: FooterContent;
  ctaDefaults: CTASectionContent;
}
