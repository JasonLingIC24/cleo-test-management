export interface BugMetric {
  key: string;
  summary: string;

  priority: string;
  severity: string;

  created: string;
  status: string;

  daysOpen: number;
  ageBucket: string;

  resolved?: string;
}

export interface BugSummary {
  totalInReportingWindow: number;

  open: number;

  criticalOpen: number;
  highOpen: number;
  mediumOpen: number;
  lowOpen: number;

  criticalPct: number;
  highPct: number;
  mediumPct: number;
  lowPct: number;

  currentOpenRate: number;

  avgOpenAge: number;
}

export interface ReleaseMetrics {
  raisedThisSprint: number;

  openThisSprint: number;
  closedThisSprint: number;

  criticalRaisedThisSprint: number;
  highRaisedThisSprint: number;
  mediumRaisedThisSprint: number;
  lowRaisedThisSprint: number;

  criticalRaisedPct: number;
  highRaisedPct: number;
  mediumRaisedPct: number;
  lowRaisedPct: number;
}
