import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";

import type { JiraTicket } from "../models/jiraTicketModels.js";

export function generateJiraTickets(
  requirements: AssuranceRequirement[],
): JiraTicket[] {
  return requirements.map((requirement) => ({
    summary: `${requirement.framework} ${requirement.id}`,

    description: `Requirement ID:
${requirement.id}

Area:
${requirement.area}

Title:
${requirement.title}

Description:
${requirement.description}

Applicability:
${requirement.applicability ?? ""}

Requirement Type:
${requirement.requirementType ?? ""}

Guidance:
${requirement.guidance ?? ""}`,

    labels: ["assurance", requirement.framework.toLowerCase()],
  }));
}
