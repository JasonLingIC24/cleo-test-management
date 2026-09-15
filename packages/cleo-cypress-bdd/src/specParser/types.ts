export interface ParsedSpec {
  feature: {
    name: string;
    tags: string[];
    scenarios: ScenarioNode[];
  };
  filePath: string;   // ✅ REQUIRED
}

export interface FeatureNode {
  name: string;
  tags: string[];
  location: SourceLocation;
  scenarios: ScenarioNode[];
}

export interface ScenarioNode {
  given: string;
  whens: WhenNode[];
  tags: string[];
  location: SourceLocation;
}
export interface ScenarioReport {
  title: string;
  steps: ThenNode[];
}
export interface WhenNode {
  description: string;
  scenarios: ScenarioReport[];
  location: SourceLocation;
}

export interface ThenNode {
  description: string;
  tags: string[];
  location: SourceLocation;
}

export interface SourceLocation {
  filePath: string;
  line: number;
  column: number;
}