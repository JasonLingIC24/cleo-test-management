export interface ReleaseNarrative {
  jiraKey: string;
  title: string;
  narrative: string;
  commitCount: number;
  commitSubjects: string[];
  type?: string;
  parentKey?: string;
  parentTitle?: string;
  components?: string[];
}

export interface ReleaseNarrativeItem {
  jiraKey: string;
  narrative: string;
}

export interface ReleaseNarrativeSection {
  title: string;
  items: ReleaseNarrativeItem[];
}
