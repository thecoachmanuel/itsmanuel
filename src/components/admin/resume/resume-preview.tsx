"use client";

import React, { useRef } from "react";
import { Download, Printer, ExternalLink, Globe, Mail, Phone, MapPin, Linkedin, Youtube, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export default function ResumePreview({
  data,
  scale = 1,
  onScaleChange,
}: ResumePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const { personalInfo, skills, experience, projects, education, certifications, customSections, settings } = data;

  const fontSizeClass =
    settings.fontSize === "small"
      ? "text-[12px] leading-relaxed"
      : settings.fontSize === "large"
      ? "text-[14px] leading-relaxed"
      : "text-[13px] leading-relaxed";

  const spacingClass =
    settings.spacing === "compact"
      ? "space-y-3"
      : settings.spacing === "spacious"
      ? "space-y-6"
      : "space-y-4";

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Floating Toolbar (Non-printable) */}
      <div className="no-print w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-300">ATS Sheet Preview</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            {settings.template.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onScaleChange && (
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={() => onScaleChange(Math.max(0.6, scale - 0.1))}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[11px] font-mono text-gray-300 px-1">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => onScaleChange(Math.min(1.3, scale + 0.1))}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() => onScaleChange(1)}
                className="p-1 text-gray-400 hover:text-white cursor-pointer ml-1"
                title="Reset Zoom"
              >
                <RotateCcw size={11} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer size={13} />
            <span>Export ATS PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="w-full overflow-x-auto flex justify-center py-2 custom-scrollbar">
        <div
          ref={printRef}
          id="ats-resume-sheet"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          className={`ats-resume-document w-full max-w-[850px] min-h-[1100px] bg-white text-[#111827] p-8 sm:p-12 rounded-xl shadow-2xl transition-transform duration-200 border border-gray-200 selection:bg-blue-200 selection:text-blue-900 ${fontSizeClass}`}
        >
          {/* ========================================================================= */}
          {/* HEADER (NAME & ATS-PARSEABLE CONTACT INFO) */}
          {/* ========================================================================= */}
          <header className="border-b-2 border-gray-800 pb-4 mb-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-gray-900 mb-1 font-serif">
              {personalInfo.fullName || "Emmanuel Olaitan"}
            </h1>
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
              {personalInfo.professionalTitle || "Senior Video Editor & Post-Production Specialist"}
            </p>

            {/* Standard Single-Line Contact Strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-600 font-medium">
              {personalInfo.email && (
                <a href={`mailto:${personalInfo.email}`} className="hover:text-blue-700 underline-offset-2">
                  {personalInfo.email}
                </a>
              )}
              {personalInfo.phone && <span>•</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>•</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.websiteUrl && <span>•</span>}
              {personalInfo.websiteUrl && (
                <a
                  href={personalInfo.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-700 underline-offset-2"
                >
                  {personalInfo.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
              {personalInfo.linkedinUrl && <span>•</span>}
              {personalInfo.linkedinUrl && (
                <a
                  href={personalInfo.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-700 underline-offset-2"
                >
                  LinkedIn
                </a>
              )}
              {personalInfo.youtubeOrGithubUrl && <span>•</span>}
              {personalInfo.youtubeOrGithubUrl && (
                <a
                  href={personalInfo.youtubeOrGithubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-700 underline-offset-2"
                >
                  Portfolio Channel
                </a>
              )}
            </div>
          </header>

          <div className={spacingClass}>
            {/* ========================================================================= */}
            {/* PROFESSIONAL SUMMARY */}
            {/* ========================================================================= */}
            {settings.showSummary && personalInfo.summary && (
              <section className="ats-section">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2 font-serif">
                  Professional Summary
                </h2>
                <p className="text-gray-800 text-justify leading-relaxed">
                  {personalInfo.summary}
                </p>
              </section>
            )}

            {/* ========================================================================= */}
            {/* CORE COMPETENCIES & TECHNICAL SKILLS */}
            {/* ========================================================================= */}
            {settings.showSkills && skills && skills.length > 0 && (
              <section className="ats-section">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2 font-serif">
                  Core Competencies & Technical Skills
                </h2>
                <div className="space-y-1.5">
                  {skills.map((cat) => (
                    <div key={cat.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-xs">
                      <span className="font-bold text-gray-900 min-w-[190px] flex-shrink-0">
                        {cat.category}:
                      </span>
                      <span className="text-gray-800 leading-normal">
                        {cat.skills.join(" • ")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* WORK EXPERIENCE */}
            {/* ========================================================================= */}
            {settings.showExperience && experience && experience.length > 0 && (
              <section className="ats-section">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2.5 font-serif">
                  Professional Experience
                </h2>
                <div className="space-y-3.5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="ats-entry break-inside-avoid">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                        <div>
                          <span className="font-bold text-gray-900 text-sm">
                            {exp.title}
                          </span>
                          <span className="text-gray-700 font-semibold">
                            {" "}— {exp.company}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 font-medium whitespace-nowrap">
                          {exp.location ? `${exp.location} | ` : ""}
                          {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                        </div>
                      </div>

                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc list-outside pl-4 space-y-1 text-gray-800 text-xs">
                          {exp.highlights.map((bullet, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* KEY PROJECTS */}
            {/* ========================================================================= */}
            {settings.showProjects && projects && projects.length > 0 && (
              <section className="ats-section">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2.5 font-serif">
                  Key Projects & Client Deliverables
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="ats-entry break-inside-avoid">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-xs">
                            {proj.name}
                          </span>
                          <span className="text-gray-600 text-[11px]">
                            ({proj.role})
                          </span>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-700 hover:text-blue-900 font-medium underline underline-offset-2 ml-1"
                              title={`Open Video: ${proj.link}`}
                            >
                              [Video Link: {proj.link.replace(/^https?:\/\/(www\.)?/, "")}]
                            </a>
                          )}
                        </div>
                        {proj.tools && proj.tools.length > 0 && (
                          <span className="text-[11px] text-gray-600 font-mono">
                            {proj.tools.join(" • ")}
                          </span>
                        )}
                      </div>

                      {proj.description && (
                        <p className="text-xs text-gray-700 mb-1 leading-normal">
                          {proj.description}
                        </p>
                      )}

                      {proj.highlights && proj.highlights.length > 0 && (
                        <ul className="list-disc list-outside pl-4 space-y-0.5 text-gray-800 text-xs">
                          {proj.highlights.map((bullet, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* EDUCATION & CERTIFICATIONS */}
            {/* ========================================================================= */}
            {(settings.showEducation || settings.showCertifications) && (
              <section className="ats-section">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2 font-serif">
                  Education & Professional Credentials
                </h2>

                <div className="space-y-2">
                  {settings.showEducation &&
                    education &&
                    education.map((edu) => (
                      <div key={edu.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                        <div>
                          <span className="font-bold text-gray-900">{edu.degree}</span>
                          <span className="text-gray-700"> — {edu.institution}</span>
                          {edu.honors && (
                            <span className="text-gray-600 italic"> ({edu.honors})</span>
                          )}
                        </div>
                        <div className="text-gray-600 font-medium whitespace-nowrap">
                          {edu.location ? `${edu.location} | ` : ""}
                          {edu.graduationYear}
                        </div>
                      </div>
                    ))}

                  {settings.showCertifications &&
                    certifications &&
                    certifications.map((cert) => (
                      <div key={cert.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                        <div>
                          <span className="font-bold text-gray-900">{cert.name}</span>
                          <span className="text-gray-700"> — {cert.issuer}</span>
                        </div>
                        <div className="text-gray-600 font-medium whitespace-nowrap">
                          {cert.issueDate}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* CUSTOM / ADDITIONAL SECTIONS */}
            {/* ========================================================================= */}
            {settings.showCustomSections &&
              customSections &&
              customSections.map((sec) => (
                <section key={sec.id} className="ats-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-2 font-serif">
                    {sec.title}
                  </h2>
                  <div className="space-y-1.5">
                    {sec.items.map((item) => (
                      <div key={item.id} className="text-xs">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-gray-900">{item.title}</span>
                          {item.date && <span className="text-gray-600 text-[11px]">{item.date}</span>}
                        </div>
                        {item.description && (
                          <p className="text-gray-700 leading-normal">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        </div>
      </div>

      {/* Global CSS for Print Mode */}
      <style jsx global>{`
        @media print {
          /* Hide all UI, headers, sidebars, buttons */
          body * {
            visibility: hidden;
          }
          /* Show ONLY the ATS resume document */
          #ats-resume-sheet,
          #ats-resume-sheet * {
            visibility: visible;
          }
          #ats-resume-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .ats-entry {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: letter portrait;
            margin: 12mm 15mm;
          }
        }
      `}</style>
    </div>
  );
}
