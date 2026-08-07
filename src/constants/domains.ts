export const AI103_COURSE_URL = "https://learn.microsoft.com/en-us/training/courses/ai-103t00";
export const AI103_STUDY_GUIDE_URL = "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-103";

export const DOMAIN_META: Record<string, { short: string; tone: string; learnUrl: string }> = {
  "Plan and manage an Azure AI solution": {
    short: "Plan & manage",
    tone: "violet",
    learnUrl: `${AI103_COURSE_URL}#course-syllabus`,
  },
  "Implement generative AI and agentic solutions": {
    short: "Generative AI & agents",
    tone: "blue",
    learnUrl: "https://learn.microsoft.com/en-us/training/browse/?terms=Azure%20AI%20Foundry%20agents%20generative%20AI",
  },
  "Implement computer vision solutions": {
    short: "Computer vision",
    tone: "orange",
    learnUrl: "https://learn.microsoft.com/en-us/training/browse/?terms=Azure%20AI%20Vision",
  },
  "Implement text analysis solutions": {
    short: "Text analysis",
    tone: "green",
    learnUrl: "https://learn.microsoft.com/en-us/training/browse/?terms=Azure%20AI%20Language%20text%20analysis",
  },
  "Implement information extraction solutions": {
    short: "Information extraction",
    tone: "pink",
    learnUrl: "https://learn.microsoft.com/en-us/training/browse/?terms=Azure%20AI%20Document%20Intelligence%20content%20understanding",
  },
};

export function questionLearnUrl(question: { subcategory: string; category: string }) {
  const terms = `${question.subcategory || question.category} Azure AI`;
  return `https://learn.microsoft.com/en-us/search/?terms=${encodeURIComponent(terms)}`;
}
