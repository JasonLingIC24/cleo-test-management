export interface AssuranceEvidenceImport {
  id: string;

  title: string;

  type: string;

  location: string;

  description?: string;

  tags: string[];

  framework?: string;

  importedAt: string;
}
