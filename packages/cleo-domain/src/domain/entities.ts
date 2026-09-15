export interface Feature {
  id: string;
  name: string;
  domain?: string;
  subdomain?: string;
  tags: string[];
  scenarios: Scenario[];
}

export interface Scenario {
  id: string;
  title: string;
  steps: Step[];
  tags?: string[];   // ✅ ADD THIS LINE
}

export interface Step {
  type: "GIVEN" | "WHEN" | "THEN";   // ✅ ADD THIS
  description: string;
  tags: string[];
}
