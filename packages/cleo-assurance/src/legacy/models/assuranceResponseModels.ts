export interface AssuranceResponse {
  requirementId: string;

  answer?: string;

  evidenceIds: string[];

  reviewed: boolean;

  reviewer?: string;
}
