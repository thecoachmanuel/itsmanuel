import { ResumeData } from "@/types/resume";

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "Emmanuel Olaitan",
    professionalTitle: "Senior Video Editor & Post-Production Specialist",
    email: "eomedia0@gmail.com",
    phone: "+234 810 000 0000",
    location: "Lagos, Nigeria (Available Globally / Remote)",
    websiteUrl: "https://www.itsmanuel.me",
    instagramUrl: "https://instagram.com/itsmanuel_",
    youtubeOrGithubUrl: "https://youtube.com/@itsmanuel",
    summary:
      "Results-driven Senior Video Editor and Motion Graphics Specialist with 5+ years of expertise crafting high-retention video content, documentary storytelling, commercial explainers, and YouTube growth campaigns. Master of DaVinci Resolve Studio, Adobe Premiere Pro, and After Effects with proven track record of boosting viewer engagement by 40%+ across client channels totaling 10M+ collective impressions.",
  },
  skills: [
    {
      id: "cat-1",
      category: "Post-Production & Editing",
      skills: [
        "DaVinci Resolve Studio",
        "Adobe Premiere Pro",
        "Multi-Camera Editing",
        "Pacing & Rhythm Optimization",
        "A-Roll & B-Roll Assembly",
        "Narrative Structuring",
      ],
    },
    {
      id: "cat-2",
      category: "Visual Effects & Motion Graphics",
      skills: [
        "Adobe After Effects",
        "Fusion VFX",
        "Kinetic Typography",
        "Lower Thirds & Infographics",
        "Logo Animation",
        "Rotoscoping & Keying",
      ],
    },
    {
      id: "cat-3",
      category: "Color Grading & Finishing",
      skills: [
        "Color Science (Rec.709 / ACES / Log)",
        "Shot Matching & Balancing",
        "Creative Look Development",
        "HDR & SDR Mastering",
        "Noise Reduction & Grain Grading",
      ],
    },
    {
      id: "cat-4",
      category: "Audio Engineering & Tools",
      skills: [
        "Fairlight Audio",
        "Adobe Audition",
        "Audio Cleanup & De-Noising",
        "Sound Design & Foley",
        "Dialogue Isolation",
        "Loudness Normalization (LUFS)",
      ],
    },
  ],
  experience: [
    {
      id: "exp-1",
      title: "Lead Video Editor & Content Strategist",
      company: "Manuel Media / Freelance Studio",
      location: "Remote / International",
      startDate: "Jan 2021",
      endDate: "Present",
      current: true,
      highlights: [
        "Lead post-production workflows for 25+ international creators, educational brands, and enterprise clients, delivering 300+ high-engagement video assets.",
        "Engineered standardized DaVinci Resolve & Premiere Pro templates, slashing production turnaround time by 35% while upholding broadcast quality standards.",
        "Increased average viewer retention by 42% through data-backed pacing, dynamic jump cuts, sound design, and custom motion graphics hooks.",
        "Spearheaded color grading and audio mastering pipelines in DaVinci Resolve Fairlight, ensuring 100% compliance with broadcast and YouTube loudness standards.",
      ],
    },
    {
      id: "exp-2",
      title: "Senior Video Editor & Motion Designer",
      company: "Stack Learner & Tech Creators Network",
      location: "Remote",
      startDate: "Mar 2022",
      endDate: "Present",
      current: true,
      highlights: [
        "Direct end-to-end video editing and visual presentation for technical software engineering tutorials and masterclasses.",
        "Designed and animated 50+ custom 2D motion graphics packages, lower thirds, and technical diagram visualizers in After Effects.",
        "Scaled channel watch time to over 500,000+ hours with consistent high-quality weekly video releases.",
      ],
    },
    {
      id: "exp-3",
      title: "Post-Production Specialist",
      company: "GrowthLeo Digital Media",
      location: "Remote",
      startDate: "Jun 2020",
      endDate: "Dec 2021",
      current: false,
      highlights: [
        "Produced high-converting commercial video ads, SaaS product walkthroughs, and social media campaigns.",
        "Collaborated with creative directors and copywriters to storyboard and translate raw customer footage into cohesive brand narratives.",
        "Executed multi-platform export specifications across 16:9, 9:16 vertical reels, and 1:1 square aspect ratios.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Engineering Career Masterclass Series",
      role: "Lead Editor & Story Producer",
      tools: ["DaVinci Resolve", "After Effects", "Fairlight"],
      link: "https://www.itsmanuel.me/project/rVVeLdouViU",
      description: "Comprehensive educational series with complex software architecture explanations and custom visual pacing.",
      highlights: [
        "Achieved 68% average percentage viewed (APV) on YouTube, exceeding industry benchmark by 28%.",
        "Developed custom kinetic typography systems for technical code syntax highlighting.",
      ],
    },
    {
      id: "proj-2",
      name: "Full Stack Roadmap & System Design Docu-Style",
      role: "Post-Production Director",
      tools: ["Premiere Pro", "After Effects", "Audition"],
      link: "https://www.itsmanuel.me/project/JSZmQxg3fos",
      description: "High-production documentary style explainer video featuring motion graphics and cinematic audio mixing.",
      highlights: [
        "Generated 250k+ organic views within 30 days of release.",
        "Integrated custom 3D motion graphics and seamless B-roll transitions.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Science in Media & Digital Communications",
      institution: "University of Lagos",
      location: "Lagos, Nigeria",
      graduationYear: "2020",
      honors: "Second Class Upper Honors",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Certified DaVinci Resolve Studio Professional",
      issuer: "Blackmagic Design",
      issueDate: "2023",
    },
    {
      id: "cert-2",
      name: "Advanced Motion Graphics & Visual Storytelling",
      issuer: "Adobe Certified Expert Program",
      issueDate: "2022",
    },
  ],
  customSections: [
    {
      id: "cust-1",
      title: "Key Strengths & Methodologies",
      items: [
        {
          id: "item-1",
          title: "Retention-Centric Editing",
          description: "Data-driven pacing, hook engineering, pattern interrupts, and seamless visual storytelling.",
        },
        {
          id: "item-2",
          title: "End-to-End Post-Production Mastery",
          description: "From assembly cut to final broadcast delivery: editing, color grading, VFX, sound design, and subtitle localization.",
        },
      ],
    },
  ],
  settings: {
    template: "classic-ats",
    fontSize: "medium",
    spacing: "standard",
    accentColor: "#0f172a",
    showSummary: true,
    showExperience: true,
    showProjects: true,
    showSkills: true,
    showEducation: true,
    showCertifications: true,
    showCustomSections: true,
  },
};
