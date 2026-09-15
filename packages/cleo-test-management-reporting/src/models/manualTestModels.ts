export interface ManualScenario {
  scenarioTitle: string;
  givenColSteps: string[];
  whenColSteps: string[];
  thenColSteps: string[];
}

export type ManualWorkbookData = Record<string, ManualScenario[]>;

export interface ManualStep {
  type: "GIVEN" | "WHEN" | "THEN";
  description: string;
}
