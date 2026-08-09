"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  Heart,
  Instagram,
  Facebook,
  Github,
} from "lucide-react";
import { FooterContent } from "@/types/content";

interface FooterProps {
  content?: FooterContent;
}

export default function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const brandName = content?.brandName || "Emmanuel Olaitan";
  const brandBio =
    content?.brandBio ||
    "Video Editor and Motion Graphics Designer passionate about creating visual stories with style, precision, and cinematic magic.";
  const quickLinksTitle = content?.quickLinksTitle || "Quick Links";
  const connectTitle = content?.connectTitle || "Connect With Me";
  const copyrightName = content?.copyrightName || "Coach Manuel";
  const copyrightUrl = content?.copyrightUrl || "https://instagram.com/thecoachmanuel";

  const defaultSocialLinks = [
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
  ];

  const socialLinks = content?.socialLinks || defaultSocialLinks;

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "youtube":
        return Youtube;
      case "instagram":
        return Instagram;
      case "linkedin":
        return Linkedin;
      case "twitter":
        return Twitter;
      case "facebook":
        return Facebook;
      case "github":
        return Github;
      default:
        return Mail;
    }
  };

  return (
    <footer className="glass-panel border-t border-white/5 mt-20 backdrop-blur-3xl">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              {brandName}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {brandBio}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-white tracking-wide uppercase text-xs opacity-70">
              {quickLinksTitle}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <Link
                href="/"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/skills"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Skills
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-white tracking-wide uppercase text-xs opacity-70">
              {connectTitle}
            </h4>
            <div className="flex space-x-5">
              {socialLinks.map((link) => {
                const IconComponent = getIcon(link.icon);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    aria-label={link.name}
                  >
                    <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all duration-300">
                      <IconComponent size={20} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
            Made with <Heart className="text-red-500 fill-red-500/20" size={14} /> by{" "}
            <a
              href={copyrightUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors underline decoration-dotted underline-offset-4"
            >
              {copyrightName}
            </a>{" "}
            © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
