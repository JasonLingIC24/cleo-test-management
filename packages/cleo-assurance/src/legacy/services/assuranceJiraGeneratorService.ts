import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";
import type { JiraTicket } from "../models/jiraTicketModels.js";

export function buildAssuranceTicket(
  requirement: AssuranceRequirement,
): JiraTicket {
  return {
    summary: `${requirement.framework}: ${requirement.id}`,

    description: requirement.description,

    labels: ["assurance", requirement.framework],
  };
}
