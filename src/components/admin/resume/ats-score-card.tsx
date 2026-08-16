"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { ResumeData } from "@/types/resume";

interface ATSScoreCardProps {
  data: ResumeData;
}

export default function ATSScoreCard({ data }: ATSScoreCardProps) {
  const analysis = useMemo(() => {
    let score = 0;
    const checks: {
      id: string;
      label: string;
      passed: boolean;
      tip: string;
      weight: number;
    }[] = [];

    // 1. Contact Information
    const hasName = Boolean(data.personalInfo.fullName?.trim());
    const hasEmail = Boolean(data.personalInfo.email?.includes("@"));
    const hasPhone = Boolean(data.personalInfo.phone?.trim());
    const hasLocation = Boolean(data.personalInfo.location?.trim());
    const hasWebsite = Boolean(data.personalInfo.websiteUrl?.trim());
    const contactPassed = hasName && hasEmail && hasPhone && hasLocation;

    checks.push({
      id: "contact",
      label: "Contact Information Completeness",
      passed: contactPassed,
      tip: contactPassed
        ? "Name, email, phone, and location are properly structured for ATS scanners."
        : "Ensure full name, valid email, phone number, and location are filled out.",
      weight: 20,
    });
    if (contactPassed) score += 20;

    // 2. Professional Summary
    const summaryWords = data.personalInfo.summary?.trim()
      ? data.personalInfo.summary.trim().split(/\s+/).length
      : 0;
    const summaryPassed = summaryWords >= 30 && summaryWords <= 120;

    checks.push({
      id: "summary",
      label: `Professional Summary (${summaryWords} words)`,
      passed: summaryPassed,
      tip: summaryPassed
        ? "Summary is within the optimal 30-120 word window."
        : "A summary between 30 and 120 words gives ATS parsers high-density context without fluff.",
      weight: 15,
    });
    if (summaryPassed) score += 15;

    // 3. Work Experience with Action Verbs & Metrics
    const experiences = data.experience || [];
    const hasEnoughExperiences = experiences.length >= 2;
    const totalBullets = experiences.reduce((acc, exp) => acc + (exp.highlights?.length || 0), 0);

    const actionVerbRegex =
      /^(lead|led|manage|managed|engineer|engineered|spearhead|spearheaded|direct|directed|develop|developed|create|created|design|designed|edit|edited|produce|produced|scale|scaled|boost|boosted|increase|increased|deliver|delivered|achieve|achieved|streamline|streamlined|optimize|optimized)/i;

    const metricRegex = /(\d+%|\$\d+|\d+\+|\d+k|\d+m|\d+,\d+)/i;

    let actionVerbCount = 0;
    let metricCount = 0;

    experiences.forEach((exp) => {
      exp.highlights?.forEach((h) => {
        if (actionVerbRegex.test(h.trim())) actionVerbCount++;
        if (metricRegex.test(h)) metricCount++;
      });
    });

    const actionVerbsPassed = totalBullets > 0 && actionVerbCount >= Math.ceil(totalBullets * 0.5);
    const metricsPassed = metricCount >= 2;

    checks.push({
      id: "action-verbs",
      label: `Action-Oriented Bullets (${actionVerbCount}/${totalBullets} verbs)`,
      passed: actionVerbsPassed,
      tip: actionVerbsPassed
        ? "Great use of strong action verbs at the beginning of bullet points."
        : "Start bullets with strong action verbs (e.g. Engineered, Spearheaded, Optimized, Delivered).",
      weight: 20,
    });
    if (actionVerbsPassed) score += 20;

    checks.push({
      id: "metrics",
      label: `Quantified Achievements & Metrics (${metricCount} found)`,
      passed: metricsPassed,
      tip: metricsPassed
        ? "Clear numbers and percentages provide concrete proof of impact."
        : "Include numbers, percentages, and metrics (e.g., '42% retention increase', '300+ videos delivered').",
      weight: 15,
    });
    if (metricsPassed) score += 15;

    // 4. Skills Categorization
    const skillsCount = (data.skills || []).reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);
    const skillsPassed = skillsCount >= 10;

    checks.push({
      id: "skills",
      label: `Technical Skills Matrix (${skillsCount} skills listed)`,
      passed: skillsPassed,
      tip: skillsPassed
        ? "Comprehensive skill matrix covering editing software, audio, color, and workflows."
        : "List at least 10 relevant software tools and core competencies to match ATS keywords.",
      weight: 15,
    });
    if (skillsPassed) score += 15;

    // 5. Education & Credentials
    const hasEducation = (data.education?.length || 0) > 0;
    checks.push({
      id: "education",
      label: "Education & Credentials Structure",
      passed: hasEducation,
      tip: hasEducation
        ? "Degree, institution, and graduation year are cleanly formatted."
        : "Include at least one education entry or formal credential.",
      weight: 15,
    });
    if (hasEducation) score += 15;

    return { score: Math.min(100, score), checks };
  }, [data]);

  const scoreColor =
    analysis.score >= 85
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : analysis.score >= 65
      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
      : "text-rose-400 border-rose-500/30 bg-rose-500/10";

  return (
    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              ATS Compliance Score
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-normal">
                Live Audit
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Evaluated against standard applicant tracking parsers (Workday, Greenhouse, Lever)
            </p>
          </div>
        </div>

        <div className={`px-3.5 py-1.5 rounded-2xl border flex items-center gap-1.5 font-bold ${scoreColor}`}>
          <TrendingUp size={16} />
          <span className="text-lg">{analysis.score}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
        <div
          className={`h-full transition-all duration-500 ${
            analysis.score >= 85
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : analysis.score >= 65
              ? "bg-gradient-to-r from-amber-500 to-orange-400"
              : "bg-gradient-to-r from-rose-500 to-red-400"
          }`}
          style={{ width: `${analysis.score}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2 pt-1">
        {analysis.checks.map((check) => (
          <div
            key={check.id}
            className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 transition-colors"
          >
            {check.passed ? (
              <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="space-y-0.5 flex-1">
              <p className="text-xs font-semibold text-white">{check.label}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{check.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
