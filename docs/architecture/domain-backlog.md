# Domain Backlog

## Status

Draft v1

## Purpose

This backlog tracks the evolution of the shared testing domain.

Current shared domain:

```text
Feature
Scenario
Step
```

Target shared domain:

```text
Requirement
AcceptanceCriteria
Feature
Scenario
Step
TestCase
Traceability
```

The goal is to establish a single canonical source of truth for business concepts used by both:

- QA Automation
- QA Intelligence

---

# Guiding Principles

## Principle 1

Domain concepts must exist independently of implementation technologies.

The domain must not depend on:

```text
Jira
Cypress
Playwright
Git
Reporting
Publishing
CLI Frameworks
Filesystem APIs
```

---

## Principle 2

Every business concept should have exactly one canonical representation.

Avoid:

```text
Feature
FeatureReport
ParsedFeature
GeneratedFeature
```

representing the same thing.

Prefer:

```text
Feature
```

with various adapters and projections.

---

## Principle 3

Adapters translate to and from domain entities.

Example:

```text
Jira
    ↓
Requirement

Cypress
    ↓
Feature

Feature
    ↓
Report
```

---

# Current Domain Inventory

## Existing

### Feature

Location:

```text
cleo-domain
```

Status:

```text
Implemented
```

---

### Scenario

Location:

```text
cleo-domain
```

Status:

```text
Implemented
```

---

### Step

Location:

```text
cleo-domain
```

Status:

```text
Implemented
```

---

# Duplication Backlog

## DOM-001

### Consolidate Step Models

Priority:

```text
High
```

Current Locations:

```text
cleo-domain
    Step

reportModels
    StepReport

manualTestModels
    ManualStep
```

Goal:

Establish a single canonical:

```text
Step
```

entity inside:

```text
qa-core
```

Notes:

```text
Reporting models should reference
domain entities where appropriate.
```

---

## DOM-002

### Consolidate Scenario Models

Priority:

```text
High
```

Current Locations:

```text
cleo-domain
    Scenario

cleo-cypress-bdd
    ScenarioNode

reportModels
    ScenarioNode
    ScenarioReport

manualTestModels
    ManualScenario
```

Goal:

Define a single canonical:

```text
Scenario
```

entity.

Allow adapter-specific ingestion models where required.

---

## DOM-003

### Consolidate Feature Models

Priority:

```text
High
```

Current Locations:

```text
cleo-domain
    Feature

reportModels
    FeatureReport
```

Goal:

Clearly separate:

```text
Feature
```

from:

```text
FeatureReport
```

and avoid duplication of feature metadata.

---

# New Domain Entities

## DOM-004

### Introduce Requirement Entity

Priority:

```text
High
```

Status:

```text
Not Implemented
```

Rationale:

Requirements currently originate from Jira but are not represented as first-class domain entities.

Proposed Model:

```ts
interface Requirement {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: AcceptanceCriteria[];
}
```

Future Consumers:

```text
qa-requirements
qa-intelligence
```

---

## DOM-005

### Introduce AcceptanceCriteria Entity

Priority:

```text
High
```

Status:

```text
Not Implemented
```

Rationale:

Acceptance criteria are parsed today but do not exist within the shared domain.

Proposed Model:

```ts
interface AcceptanceCriteria {
  id: string;
  description: string;
}
```

Future Consumers:

```text
qa-requirements
qa-gherkin
qa-cypress
```

---

## DOM-006

### Introduce TestCase Entity

Priority:

```text
High
```

Status:

```text
Not Implemented
```

Rationale:

Test cases are generated but have no shared representation.

Proposed Model:

```ts
interface TestCase {
  id: string;
  title: string;
  steps: Step[];
}
```

Future Consumers:

```text
qa-automation
qa-intelligence
```

---

## DOM-007

### Introduce TestSuite Entity

Priority:

```text
Medium
```

Status:

```text
Not Implemented
```

Rationale:

Allows grouping of generated and executed tests.

---

## DOM-008

### Introduce Traceability Entity

Priority:

```text
High
```

Status:

```text
Not Implemented
```

Rationale:

Traceability is a core capability connecting requirements and execution.

Target Relationship:

```text
Requirement
    ↓
Feature
    ↓
Scenario
    ↓
TestCase
```

---

## DOM-009

### Introduce Requirement Links

Priority:

```text
Medium
```

Status:

```text
Not Implemented
```

Rationale:

Allow relationships between parent and child requirements.

Example:

```text
Epic
    ↓
Story
```

---

# Automation Domain Evolution

## AUT-DOM-001

### Feature To Cypress Mapping Contract

Priority:

```text
High
```

Rationale:

Future Cypress generation should operate from domain entities rather than Jira structures.

Target Flow:

```text
Requirement
    ↓
Feature
    ↓
Scenario
    ↓
Cypress Spec
```

---

## AUT-DOM-002

### Gherkin To Domain Mapping

Priority:

```text
Medium
```

Rationale:

Ensure generated feature files can be re-ingested into the shared domain.

Target Flow:

```text
Feature File
    ↓
Feature
Scenario
Step
```

---

## AUT-DOM-003

### Domain Roundtrip Validation

Priority:

```text
Medium
```

Target:

```text
Jira
    ↓
Domain
    ↓
Feature File
    ↓
Domain
```

Lossless transformation validation.

---

# Architecture Debt Register

## AD-001

### reportModels Contains Multiple Responsibilities

Current State:

```text
Domain-like models
Reporting models
Parsed BDD models
```

Desired State:

```text
Domain models live in qa-core

Report models live in qa-intelligence
```

Priority:

```text
High
```

---

## AD-002

### Multiple Scenario Representations

Current State:

```text
Scenario
ScenarioNode
ScenarioReport
ManualScenario
```

Desired State:

```text
Canonical Scenario
```

Plus adapter-specific translation models.

Priority:

```text
High
```

---

## AD-003

### Multiple Step Representations

Current State:

```text
Step
StepReport
ManualStep
```

Desired State:

```text
Canonical Step
```

Priority:

```text
High
```

---

# Success Criteria

The domain backlog will be considered complete when:

✅ Requirement exists as a first-class domain entity

✅ AcceptanceCriteria exists as a first-class domain entity

✅ Feature exists in one canonical representation

✅ Scenario exists in one canonical representation

✅ Step exists in one canonical representation

✅ TestCase exists in one canonical representation

✅ Traceability exists in one canonical representation

✅ QA Automation consumes domain entities

✅ QA Intelligence consumes domain entities

✅ Domain entities are independent of Jira, Cypress, reporting and publishing concerns

---

# Next Review

Review the following packages and map all entities to the shared domain:

```text
cleo-domain
cleo-
```
