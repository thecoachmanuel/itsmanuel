"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import GlassmorphismCard from "@/components/glassmorphism-card";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
  BarChart3,
  FileSearch,
  ScissorsSquare,
  Brush,
  Eye,
  Send,
  Star,
} from "lucide-react";
import CTASection from "@/components/CTASection";
import {
  videoEditingSkills,
  specializations,
  achievements,
  workflow,
} from "@/db/skills";

const iconMap = [
  { icon: <FileSearch size={20} />, bg: "#0ea5e9" }, // Project Analysis
  { icon: <Eye size={20} />, bg: "#a855f7" }, // Content Review
  { icon: <ScissorsSquare size={20} />, bg: "#f97316" }, // Rough Cut
  { icon: <Brush size={20} />, bg: "#10b981" }, // Fine Tuning
  { icon: <BarChart3 size={20} />, bg: "#f43f5e" }, // Client Review
  { icon: <Send size={20} />, bg: "#6366f1" }, // Final Delivery
];

export default function SkillsPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="text-center mb-24 relative"
        >
          {/* Spotlight Effect behind title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/15 blur-[100px] rounded-full pointer-events-none" />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mt-0 md:mt-16 mb-6 text-white tracking-tight relative z-10">
            <span className="bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent">
              My Skills & Expertise
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed relative z-10">
            With years of experience in video editing and motion graphics, I
            bring technical expertise and creative vision to every project.
            Here's what I can do for you.
          </p>
        </m.div>

        {/* Technical Skills */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-center">
            Technical Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoEditingSkills.map((skill, index) => (
              <m.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassmorphismCard className="p-6">
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="relative w-12 md:w-16 h-12 md:h-16">
                      <Image
                        src={skill.image_link}
                        alt={skill.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {skill.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    {skill.description}
                  </p>
                </GlassmorphismCard>
              </m.div>
            ))}
          </div>
        </m.div>

        {/* Specializations */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-center">
            Specializations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec, index) => (
              <m.div
                key={spec.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <GlassmorphismCard className="p-6 h-full">
                  <div className="text-3xl mb-4">{spec.icon}</div>
                  <h3 className="text-lg font-semibold mb-3 text-white">
                    {spec.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {spec.description}
                  </p>
                  <div className="space-y-2">
                    {spec.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-gray-600 text-gray-300 mr-2 mb-2"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </GlassmorphismCard>
              </m.div>
            ))}
          </div>
        </m.div>

        {/* Achievements */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-center">
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <m.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
              >
                <GlassmorphismCard className="p-6 text-center h-full">
                  <achievement.icon
                    className={`${achievement.color} mx-auto mb-4`}
                    size={32}
                  />
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {achievement.description}
                  </p>
                </GlassmorphismCard>
              </m.div>
            ))}
          </div>
        </m.div>

        {/* Workflow */}
        {/* <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-center">
            My Workflow
          </h2>
          <div className="space-y-6">
            {workflow.map((step, index) => (
              <m.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              >
                <GlassmorphismCard className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {step.title}
                      </h3>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                  </div>
                </GlassmorphismCard>
              </m.div>
            ))}
          </div>
        </m.div> */}

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white text-center">
            My Workflow
          </h2>

          <GlassmorphismCard className="p-4 md:p-8">
            <VerticalTimeline animate={true} lineColor="#3b82f6">
              {workflow.map((step, index) => (
                <VerticalTimelineElement
                  key={step.step}
                  className="vertical-timeline-element--work"
                  date={`Step ${step.step}`}
                  contentStyle={{
                    background: "rgb(30, 41, 59)",
                    color: "#fff",
                  }}
                  contentArrowStyle={{
                    borderRight: "7px solid rgb(30, 41, 59)",
                  }}
                  iconStyle={{
                    background: iconMap[index]?.bg || "#3b82f6",
                    color: "#fff",
                  }}
                  icon={iconMap[index]?.icon || <Star size={20} />}
                >
                  <h3 className="vertical-timeline-element-title text-white text-lg font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-gray-300">{step.description}</p>
                </VerticalTimelineElement>
              ))}

              <VerticalTimelineElement
                iconStyle={{ background: "rgb(34,197,94)", color: "#fff" }}
                icon={<Star size={20} />}
              />
            </VerticalTimeline>
          </GlassmorphismCard>
        </m.div>

        {/* CTA Section */}
        <CTASection
          title="Ready to Work Together?"
          description="Let's discuss your video editing needs and create something amazing together. I'm here to help bring your vision to life with professional quality and creative flair."
          buttonText="Start Your Project"
          href="/contact"
        />
      </div>
    </div>
  );
}
