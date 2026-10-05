import type { ReleaseTheme } from "../models/releaseThemeModels.js";

export function buildThemeNarrative(title: string, bullets: string[]): string {
  const lower = title.toLowerCase();

  if (lower.includes("111 case form")) {
    return "The NHS 111 case form has been enhanced to improve patient data capture, GP Practice management and workflow efficiency.";
  }

  if (lower.includes("pathways")) {
    return "NHS Pathways functionality has been enhanced to support triage launch, completion and outcome capture directly within the workflow.";
  }

  if (lower.includes("pem")) {
    return "Patient Event Messaging functionality has been enhanced to improve delivery, routing, suppression and auditing.";
  }

  if (lower.includes("repeat caller")) {
    return "Repeat Caller Service functionality has been enhanced to improve caller identification and search processing.";
  }

  if (bullets.length > 0) {
    return `This area has been enhanced through ${bullets.length} delivered improvements.`;
  }

  return "";
}
