"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";

interface GlassmorphismCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassmorphismCard({
  children,
  className = "",
  hover = true,
}: GlassmorphismCardProps) {
  return (
    <m.div
      className={`
        relative overflow-hidden
        glass-card
        ${className}
      `}
      whileHover={hover ? {
        y: -6,
        scale: 1.01,
      } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1] // Custom refined spring-like ease
      }}
    >
      {/* Inner subtle noise/highlight overlay for texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-gradient-to-br from-white via-white/50 to-transparent mix-blend-overlay" />

      {/* Edge Reflection */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none ring-1 ring-inset ring-white/10" />

      {/* Content Container */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </m.div>
  );
}
