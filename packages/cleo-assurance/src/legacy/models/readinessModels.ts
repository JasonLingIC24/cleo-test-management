export interface ReadinessResult {
  frameworkId: string;

  readinessPercentage: number;

  completedRequirements: number;

  totalRequirements: number;

  blockedRequirements: number;
}
