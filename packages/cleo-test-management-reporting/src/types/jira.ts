/* =========================
   TYPES
========================= */

export type NoteType = "Feature" | "Fix" | "Improvement";

export interface JiraConfig {
  baseUrl: string;
  email: string;
  token: string;
  projectKey: string;
  boardId: number;
}

export interface JiraComponent {
  name?: string;
}

export interface JiraApiIssueResponse {
  fields?: {
    summary?: string;
    description?: any;
    issuetype?: {
      name?: string;
    };
    components?: JiraComponent[];
  };
}

export interface JiraSearchResponse {
  total: number;
  issues: Array<{ key: string }>;
}

export interface ReleaseItem {
  key: string;
  summary: string;
  type: NoteType;
  component?: string;
}
