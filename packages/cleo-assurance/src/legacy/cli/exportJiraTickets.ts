import { readFileSync } from "node:fs";

import { writeFileSync } from "node:fs";

import type { AssuranceRequirementsDocument } from "../models/assuranceRequirementsDocumentModels.js";

import { generateJiraTickets } from "../services/jiraTicketGeneratorService.js";

const document = JSON.parse(
  readFileSync("./requirements.json", "utf8"),
) as AssuranceRequirementsDocument;

const tickets = generateJiraTickets(document.requirements);

writeFileSync("./jira-tickets.json", JSON.stringify(tickets, null, 2));

console.log(`Generated ${tickets.length} Jira tickets`);
