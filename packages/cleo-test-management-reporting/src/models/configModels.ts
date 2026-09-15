import type { JiraConfig } from "../types/jira.js";
import type { GithubConfig } from "../types/github.js";

export interface CleoConfig {
  manualRequired: boolean;

  input: {
    specs: string;
  };

  paths: {
    assets: {
      templates: string;
      manual: string;
    };
  };

  testResults: {
    frontend: string;
    backend: string;
    cypress: string;
    manual: string;
    automated: string;
    github?: string;
  };

  reports: {
    root: string;
    docs: string;
  };

  templates: {
    releaseNotes: string;
    summaryReport: string;
  };

  product: {
    name: string;
    logo: string;
  };

  release: {
    version: string;
    environment: string;
    release: string;
    buildNumber: string;
  };

  testing: {
    historicBugWindowDays: number;
    releaseStartDate: string;
    releaseEndDate: string;
    featuresNotTested: string[];
  };

  owners: {
    productOwner: string;
    director: string;
    architect: string;
    qaTeam: string;
    author: string;
  };

  jira: JiraConfig;

  github: GithubConfig;
}
