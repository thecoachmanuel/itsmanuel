export interface ResumeExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  role: string;
  tools: string[];
  link?: string;
  description: string;
  highlights: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  honors?: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface ResumeSkillCategory {
  id: string;
  category: string;
  skills: string[];
}

export interface ResumeCustomItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export interface ResumeCustomSection {
  id: string;
  title: string;
  items: ResumeCustomItem[];
}

export interface ResumeSettings {
  template: "classic-ats" | "modern-ats" | "compact-ats";
  fontSize: "small" | "medium" | "large";
  spacing: "compact" | "standard" | "spacious";
  accentColor: string;
  showSummary: boolean;
  showExperience: boolean;
  showProjects: boolean;
  showSkills: boolean;
  showEducation: boolean;
  showCertifications: boolean;
  showCustomSections: boolean;
}

export interface ResumeData {
  _id?: string;
  updatedAt?: string;
  personalInfo: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    websiteUrl: string;
    instagramUrl: string;
    youtubeOrGithubUrl: string;
    summary: string;
  };
  skills: ResumeSkillCategory[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  customSections: ResumeCustomSection[];
  settings: ResumeSettings;
}
