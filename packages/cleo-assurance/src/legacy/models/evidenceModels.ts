export type EvidenceType =
  | "policy"
  | "architecture"
  | "certificate"
  | "test"
  | "security"
  | "privacy"
  | "contract"
  | "report"
  | "other";

export interface EvidenceItem {
  id: string;

  title: string;

  type: EvidenceType;

  description?: string;

  location: string;

  tags: string[];

  lastReviewed?: string;
}
