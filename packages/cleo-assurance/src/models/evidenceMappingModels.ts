export interface EvidenceMapping {
  requirementId: string;

  evidenceIds: string[];

  confidence: "low" | "medium" | "high";
}
