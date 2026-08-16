import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  convertInchesToTwip,
  TabStopType,
  TabStopPosition,
} from "docx";
import { ResumeData } from "@/types/resume";

const FONT_FAMILY = "Times New Roman";
const LINE_SPACING_1_5 = 360; // 240 is 1.0, 360 is 1.5 line spacing

/**
 * Creates a standard uppercase ATS section heading with a bottom border rule
 */
function createSectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120, line: LINE_SPACING_1_5 },
    border: {
      bottom: {
        color: "000000",
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        font: FONT_FAMILY,
        size: 26, // 13pt
        color: "000000",
      }),
    ],
  });
}

/**
 * Generates an ATS-compliant Word DOCX document from ResumeData and downloads it in browser
 */
export async function exportResumeToDocx(data: ResumeData): Promise<void> {
  const { personalInfo, skills, experience, projects, education, certifications, customSections, settings } = data;

  const children: Paragraph[] = [];

  // =========================================================================
  // 1. HEADER: FULL NAME, TITLE, CONTACT STRIP
  // =========================================================================
  // Full Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60, line: 280 },
      children: [
        new TextRun({
          text: (personalInfo.fullName || "Emmanuel Olaitan").toUpperCase(),
          bold: true,
          font: FONT_FAMILY,
          size: 40, // 20pt
          color: "000000",
        }),
      ],
    })
  );

  // Professional Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100, line: LINE_SPACING_1_5 },
      children: [
        new TextRun({
          text: (personalInfo.professionalTitle || "Senior Video Editor & Post-Production Specialist").toUpperCase(),
          bold: true,
          font: FONT_FAMILY,
          size: 24, // 12pt
          color: "333333",
        }),
      ],
    })
  );

  // Contact Strip with Hyperlinks
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];

  const addContactItem = (text: string, url?: string) => {
    if (contactRuns.length > 0) {
      contactRuns.push(
        new TextRun({
          text: "  •  ",
          font: FONT_FAMILY,
          size: 22,
          color: "555555",
        })
      );
    }

    if (url) {
      contactRuns.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text,
              style: "Hyperlink",
              font: FONT_FAMILY,
              size: 22, // 11pt
              underline: {},
              color: "0000EE",
            }),
          ],
          link: url,
        })
      );
    } else {
      contactRuns.push(
        new TextRun({
          text,
          font: FONT_FAMILY,
          size: 22,
          color: "333333",
        })
      );
    }
  };

  if (personalInfo.email) {
    addContactItem(personalInfo.email, `mailto:${personalInfo.email}`);
  }
  if (personalInfo.phone) {
    addContactItem(personalInfo.phone);
  }
  if (personalInfo.location) {
    addContactItem(personalInfo.location);
  }
  if (personalInfo.websiteUrl) {
    addContactItem("Portfolio Website", personalInfo.websiteUrl);
  }
  if (personalInfo.instagramUrl) {
    addContactItem("Instagram", personalInfo.instagramUrl);
  }
  if (personalInfo.youtubeOrGithubUrl) {
    addContactItem("YouTube Channel", personalInfo.youtubeOrGithubUrl);
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160, line: LINE_SPACING_1_5 },
      border: {
        bottom: {
          color: "000000",
          space: 6,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: contactRuns,
    })
  );

  // =========================================================================
  // 2. PROFESSIONAL SUMMARY
  // =========================================================================
  if (settings.showSummary && personalInfo.summary?.trim()) {
    children.push(createSectionHeader("Professional Summary"));
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 60, after: 120, line: LINE_SPACING_1_5 },
        children: [
          new TextRun({
            text: personalInfo.summary.trim(),
            font: FONT_FAMILY,
            size: 24, // 12pt
            color: "000000",
          }),
        ],
      })
    );
  }

  // =========================================================================
  // 3. CORE COMPETENCIES & TECHNICAL SKILLS
  // =========================================================================
  if (settings.showSkills && skills && skills.length > 0) {
    children.push(createSectionHeader("Core Competencies & Technical Skills"));
    skills.forEach((cat) => {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40, line: LINE_SPACING_1_5 },
          children: [
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              font: FONT_FAMILY,
              size: 24,
              color: "000000",
            }),
            new TextRun({
              text: cat.skills.join(" • "),
              font: FONT_FAMILY,
              size: 24,
              color: "111111",
            }),
          ],
        })
      );
    });
  }

  // =========================================================================
  // 4. PROFESSIONAL EXPERIENCE
  // =========================================================================
  if (settings.showExperience && experience && experience.length > 0) {
    children.push(createSectionHeader("Professional Experience"));

    experience.forEach((exp) => {
      // Role & Company line with location and date aligned
      const dateText = `${exp.location ? `${exp.location} | ` : ""}${exp.startDate} – ${exp.current ? "Present" : exp.endDate}`;

      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40, line: LINE_SPACING_1_5 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              font: FONT_FAMILY,
              size: 24, // 12pt
              color: "000000",
            }),
            new TextRun({
              text: ` — ${exp.company}`,
              font: FONT_FAMILY,
              size: 24,
              color: "222222",
            }),
            new TextRun({
              text: `\t${dateText}`,
              font: FONT_FAMILY,
              size: 22,
              color: "444444",
            }),
          ],
        })
      );

      // Bullets
      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach((bullet) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 40, line: LINE_SPACING_1_5 },
              children: [
                new TextRun({
                  text: bullet,
                  font: FONT_FAMILY,
                  size: 24,
                  color: "111111",
                }),
              ],
            })
          );
        });
      }
    });
  }

  // =========================================================================
  // 5. KEY PROJECTS & CLIENT DELIVERABLES
  // =========================================================================
  if (settings.showProjects && projects && projects.length > 0) {
    children.push(createSectionHeader("Key Projects & Client Deliverables"));

    projects.forEach((proj) => {
      const toolText = proj.tools && proj.tools.length > 0 ? proj.tools.join(" • ") : "";

      const titleChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          font: FONT_FAMILY,
          size: 24,
          color: "000000",
        }),
        new TextRun({
          text: ` (${proj.role})`,
          font: FONT_FAMILY,
          size: 22,
          color: "444444",
        }),
      ];

      if (proj.link) {
        titleChildren.push(
          new TextRun({
            text: "  ",
          }),
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: `[Video Link: ${proj.link.replace(/^https?:\/\/(www\.)?/, "")}]`,
                font: FONT_FAMILY,
                size: 22,
                color: "0000EE",
                underline: {},
              }),
            ],
            link: proj.link,
          })
        );
      }

      if (toolText) {
        titleChildren.push(
          new TextRun({
            text: `\t${toolText}`,
            font: FONT_FAMILY,
            size: 20,
            color: "555555",
          })
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40, line: LINE_SPACING_1_5 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          children: titleChildren,
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            spacing: { before: 20, after: 40, line: LINE_SPACING_1_5 },
            children: [
              new TextRun({
                text: proj.description,
                font: FONT_FAMILY,
                size: 24,
                color: "222222",
              }),
            ],
          })
        );
      }

      if (proj.highlights && proj.highlights.length > 0) {
        proj.highlights.forEach((bullet) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 30, line: LINE_SPACING_1_5 },
              children: [
                new TextRun({
                  text: bullet,
                  font: FONT_FAMILY,
                  size: 24,
                  color: "111111",
                }),
              ],
            })
          );
        });
      }
    });
  }

  // =========================================================================
  // 6. EDUCATION & CERTIFICATIONS
  // =========================================================================
  if ((settings.showEducation && education && education.length > 0) || (settings.showCertifications && certifications && certifications.length > 0)) {
    children.push(createSectionHeader("Education & Professional Credentials"));

    if (settings.showEducation && education) {
      education.forEach((edu) => {
        const eduDate = `${edu.location ? `${edu.location} | ` : ""}${edu.graduationYear}`;
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40, line: LINE_SPACING_1_5 },
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                font: FONT_FAMILY,
                size: 24,
                color: "000000",
              }),
              new TextRun({
                text: ` — ${edu.institution}`,
                font: FONT_FAMILY,
                size: 24,
                color: "222222",
              }),
              new TextRun({
                text: `\t${eduDate}`,
                font: FONT_FAMILY,
                size: 22,
                color: "444444",
              }),
            ],
          })
        );
      });
    }

    if (settings.showCertifications && certifications) {
      certifications.forEach((cert) => {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40, line: LINE_SPACING_1_5 },
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            children: [
              new TextRun({
                text: cert.name,
                bold: true,
                font: FONT_FAMILY,
                size: 24,
                color: "000000",
              }),
              new TextRun({
                text: ` — ${cert.issuer}`,
                font: FONT_FAMILY,
                size: 24,
                color: "222222",
              }),
              new TextRun({
                text: `\t${cert.issueDate}`,
                font: FONT_FAMILY,
                size: 22,
                color: "444444",
              }),
            ],
          })
        );
      });
    }
  }

  // =========================================================================
  // 7. CUSTOM SECTIONS
  // =========================================================================
  if (settings.showCustomSections && customSections) {
    customSections.forEach((sec) => {
      children.push(createSectionHeader(sec.title));
      sec.items.forEach((item) => {
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 40, line: LINE_SPACING_1_5 },
            children: [
              new TextRun({
                text: item.title,
                bold: true,
                font: FONT_FAMILY,
                size: 24,
                color: "000000",
              }),
              item.date
                ? new TextRun({
                    text: ` (${item.date})`,
                    font: FONT_FAMILY,
                    size: 22,
                    color: "555555",
                  })
                : new TextRun({ text: "" }),
            ],
          })
        );

        if (item.description) {
          children.push(
            new Paragraph({
              spacing: { before: 20, after: 40, line: LINE_SPACING_1_5 },
              children: [
                new TextRun({
                  text: item.description,
                  font: FONT_FAMILY,
                  size: 24,
                  color: "222222",
                }),
              ],
            })
          );
        }
      });
    });
  }

  // =========================================================================
  // CREATE DOCX DOCUMENT
  // =========================================================================
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  });

  // Pack and trigger browser download
  const blob = await Packer.toBlob(doc);
  const cleanName = (personalInfo.fullName || "Emmanuel_Olaitan").replace(/\s+/g, "_");
  const filename = `${cleanName}_ATS_Resume.docx`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
