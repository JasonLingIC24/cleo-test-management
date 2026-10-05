import type { ReleaseTheme } from "../models/releaseThemeModels.js";

export function buildThemePrompt(theme: ReleaseTheme): string {
  const bulletSection = theme.userFacingBullets.map((b) => `- ${b}`).join("\n");

  const narrativeSection = theme.narratives
    .map((n) => `[${n.jiraKey}] ${n.narrative}`)
    .join("\n\n");

  return `
You are writing release notes for users and stakeholders.

Audience:
- NHS 111 users
- Operational users
- Product owners
- Service managers

Requirements:
- Produce a stakeholder-friendly release note section.
- Explain what changed.
- Explain why the changes are useful.
- Do not mention Jira.
- Do not mention tickets.
- Do not mention commits.
- Do not mention code, APIs, endpoints or implementation details.
- Use clear language.
- Write 1 or 2 short paragraphs.

Capability:
${theme.capability}

Theme:
${theme.title}

Delivered Changes:
${bulletSection}

Additional Context:
${narrativeSection}

Output:
Release note section only.
`.trim();
}
