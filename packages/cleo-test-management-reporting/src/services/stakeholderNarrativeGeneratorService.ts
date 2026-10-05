import type { ReleaseTheme } from "../models/releaseThemeModels.js";

export function buildStakeholderNarrativePrompt(theme: ReleaseTheme): string {
  const bullets = theme.userFacingBullets.map((b) => `- ${b}`).join("\n");

  const narratives = theme.narratives
    .map((n) => `[${n.jiraKey}] ${n.narrative}`)
    .join("\n\n");

  return `
You are writing release notes for end users and stakeholders.

Audience:
- Operational users
- Clinical users
- Product Owners
- Service Managers

Requirements:
- Write a stakeholder-friendly release note section.
- Explain what changed.
- Explain why the change is useful.
- Use plain English.
- Do not mention Jira tickets.
- Do not mention commits.
- Do not mention implementation details.
- Write 1 to 2 short paragraphs.
- Focus on user benefits and business impact.

Theme:
${theme.title}

Capability:
${theme.capability}

Delivered Changes:
${bullets}

Additional Context:
${narratives}

Output:
Release note section only.
`.trim();
}

export function generateStakeholderNarrative(theme: ReleaseTheme): string {
  const bullets = theme.userFacingBullets;

  if (bullets.length === 0) {
    return theme.themeNarrative;
  }

  const firstThree = bullets.slice(0, 3).join(" ");

  return (
    `This release introduces enhancements within ${theme.title}. ` + firstThree
  );
}
