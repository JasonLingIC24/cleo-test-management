# Capability Register

## Status

Draft v1

## Purpose

This document provides a complete inventory of the business capabilities currently implemented within the Cleo platform.

The register supports:

- Product boundary definition
- Migration planning
- Refactoring decisions
- Repository separation planning
- Shared domain identification
- Architecture governance

---

# Product Classification

Capabilities are grouped into four areas:

## Shared Domain

Technology-independent testing concepts.

Future Owner:

```text
qa-core
```

---

## QA Automation

Capabilities responsible for transforming requirements into automation assets.

Future Owner:

```text
qa-automation
```

---

## QA Intelligence

Capabilities responsible for analysing delivery, testing and release outcomes.

Future Owner:

```text
qa-intelligence
```

---

## Application

Capabilities responsible for orchestration, configuration and runtime behaviour.

---

# Shared Domain Capabilities

These capabilities represent business concepts that should exist independently of any technology, framework or tool.

| Capability                | Current Location | Future Owner | Status   |
| ------------------------- | ---------------- | ------------ | -------- |
| Feature Model             | cleo-domain      | qa-core      | Existing |
| Scenario Model            | cleo-domain      | qa-core      | Existing |
| Step Model                | cleo-domain      | qa-core      | Existing |
| Requirement Model         | Not Implemented  | qa-core      | Planned  |
| Acceptance Criteria Model | Not Implemented  | qa-core      | Planned  |
| Test Case Model           | Not Implemented  | qa-core      | Planned  |
| Test Suite Model          | Not Implemented  | qa-core      | Planned  |
| Traceability Model        | Not Implemented  | qa-core      | Planned  |
| Requirement References    | Not Implemented  | qa-core      | Planned  |
| Shared Domain Contracts   | Partial          | qa-core      | Expand   |
| Shared Tags Model         | Partial          | qa-core      | Review   |

---

# QA Automation Capabilities

## Requirements Engineering

Purpose:

```text
Transform requirements into structured test design assets.
```

| Capability                  | Current Package     | Future Package  | Status   |
| --------------------------- | ------------------- | --------------- | -------- |
| Requirement Extraction      | cleo-test-generator | qa-requirements | Existing |
| Jira Requirement Export     | cleo-test-generator | qa-requirements | Existing |
| Jira Requirement Analysis   | cleo-test-generator | qa-requirements | Existing |
| Jira ADF Parsing            | cleo-test-generator | qa-requirements | Existing |
| Jira Description Parsing    | cleo-test-generator | qa-requirements | Existing |
| Acceptance Criteria Parsing | cleo-test-generator | qa-requirements | Existing |
| Scenario Building           | cleo-test-generator | qa-requirements | Existing |
| Actor Extraction            | cleo-test-generator | qa-requirements | Existing |

---

## Feature & BDD Generation

Purpose:

```text
Generate executable behaviour specifications.
```

| Capability              | Current Package     | Future Package  | Status   |
| ----------------------- | ------------------- | --------------- | -------- |
| Feature Generation      | cleo-test-generator | qa-requirements | Existing |
| Gherkin Generation      | cleo-test-generator | qa-gherkin      | Existing |
| BDD Generation          | cleo-test-generator | qa-gherkin      | Existing |
| Feature File Generation | cleo-test-generator | qa-gherkin      | Existing |
| Scenario Expansion      | cleo-test-generator | qa-gherkin      | Existing |

---

## Test Asset Generation

Purpose:

```text
Generate reusable automation assets.
```

| Capability                   | Current Package     | Future Package | Status   |
| ---------------------------- | ------------------- | -------------- | -------- |
| Test Case Generation         | cleo-test-generator | qa-automation  | Existing |
| Test Summary Generation      | cleo-test-generator | qa-automation  | Existing |
| Automation Asset Generation  | Partial             | qa-automation  | Emerging |
| Cypress Spec Generation      | Not Implemented     | qa-cypress     | Planned  |
| Feature → Cypress Generation | Not Implemented     | qa-cypress     | Planned  |
| Gherkin → Cypress Generation | Not Implemented     | qa-cypress     | Planned  |

---

## Cypress Analysis

Purpose:

```text
Convert Cypress specifications into domain representations.
```

| Capability                   | Current Package  | Future Package | Status   |
| ---------------------------- | ---------------- | -------------- | -------- |
| Cypress Spec Parsing         | cleo-cypress-bdd | qa-cypress     | Existing |
| AST Analysis                 | cleo-cypress-bdd | qa-cypress     | Existing |
| BDD Extraction               | cleo-cypress-bdd | qa-cypress     | Existing |
| Feature Extraction           | cleo-cypress-bdd | qa-cypress     | Existing |
| Scenario Extraction          | cleo-cypress-bdd | qa-cypress     | Existing |
| Step Extraction              | cleo-cypress-bdd | qa-cypress     | Existing |
| ParsedSpec Modelling         | cleo-cypress-bdd | qa-cypress     | Existing |
| Cypress → Domain Translation | cleo-domain      | qa-core        | Existing |
| Feature Mapping              | cleo-domain      | qa-core        | Existing |
| Scenario Mapping             | cleo-domain      | qa-core        | Existing |
| Step Mapping                 | cleo-domain      | qa-core        | Existing |

---

## Automation Migration

Purpose:

```text
Standardise and modernise automation assets.
```

| Capability                | Current Package      | Future Package | Status   |
| ------------------------- | -------------------- | -------------- | -------- |
| Cypress Codemods          | cleo-cypress-codemod | qa-codemods    | Existing |
| AST Transformations       | cleo-cypress-codemod | qa-codemods    | Existing |
| Test Standardisation      | cleo-cypress-codemod | qa-codemods    | Existing |
| Domain Tag Enrichment     | cleo-cypress-codemod | qa-codemods    | Existing |
| Feature Wrapper Migration | cleo-cypress-codemod | qa-codemods    | Existing |
| Nested Tag Migration      | cleo-cypress-codemod | qa-codemods    | Existing |
| Source Modernisation      | cleo-cypress-codemod | qa-codemods    | Existing |

---

# QA Intelligence Capabilities

## Delivery Intelligence

Purpose:

```text
Understand what changed and what was delivered.
```

| Capability            | Current Package                | Future Package  | Status   |
| --------------------- | ------------------------------ | --------------- | -------- |
| Git Analysis          | cleo-test-management-reporting | qa-intelligence | Existing |
| Commit Analysis       | cleo-test-management-reporting | qa-intelligence | Existing |
| Commit Classification | cleo-test-management-reporting | qa-intelligence | Existing |
| Change Analysis       | cleo-test-management-reporting | qa-intelligence | Existing |
| Jira Correlation      | cleo-test-management-reporting | qa-intelligence | Existing |
| Release Correlation   | cleo-test-management-reporting | qa-intelligence | Existing |

---

## Jira Intelligence

Purpose:

```text
Understand work delivered through Jira.
```

| Capability                | Current Package                | Future Package  | Status   |
| ------------------------- | ------------------------------ | --------------- | -------- |
| Jira Integration          | cleo-test-management-reporting | qa-intelligence | Existing |
| Jira Release Analysis     | cleo-test-management-reporting | qa-intelligence | Existing |
| Jira Version Analysis     | cleo-test-management-reporting | qa-intelligence | Existing |
| Jira Sprint Analysis      | cleo-test-management-reporting | qa-intelligence | Existing |
| Jira Dashboard Generation | cleo-test-management-reporting | qa-intelligence | Existing |
| Jira Enrichment           | cleo-test-management-reporting | qa-intelligence | Existing |
| Jira Publishing           | cleo-test-management-reporting | qa-intelligence | Existing |

---

## Results Intelligence

Purpose:

```text
Understand test execution outcomes.
```

| Capability                   | Current Package                | Future Package  | Status   |
| ---------------------------- | ------------------------------ | --------------- | -------- |
| Results Aggregation          | cleo-test-management-reporting | qa-intelligence | Existing |
| Manual Results Parsing       | cleo-test-management-reporting | qa-intelligence | Existing |
| Automated Results Processing | cleo-test-management-reporting | qa-intelligence | Existing |
| Test Result Correlation      | cleo-test-management-reporting | qa-intelligence | Existing |
| KPI Calculation              | cleo-test-management-reporting | qa-intelligence | Existing |

---

## Reporting

Purpose:

```text
Generate quality and testing reports.
```

| Capability               | Current Package                | Future Package  | Status   |
| ------------------------ | ------------------------------ | --------------- | -------- |
| Execution Reports        | cleo-test-management-reporting | qa-intelligence | Existing |
| Test Summary Reports     | cleo-test-management-reporting | qa-intelligence | Existing |
| Word Report Generation   | cleo-test-management-reporting | qa-intelligence | Existing |
| Excel Report Generation  | cleo-test-management-reporting | qa-intelligence | Existing |
| Dashboard Generation     | cleo-test-management-reporting | qa-intelligence | Existing |
| Bug Metrics Reporting    | cleo-test-management-reporting | qa-intelligence | Existing |
| Documentation Generation | cleo-test-management-reporting | qa-intelligence | Existing |

---

## Release Intelligence

Purpose:

```text
Generate stakeholder-focused release information.
```

| Capability                       | Current Package                | Future Package  | Status   |
| -------------------------------- | ------------------------------ | --------------- | -------- |
| Release Notes Generation         | cleo-test-management-reporting | qa-intelligence | Existing |
| Release Narrative Generation     | cleo-test-management-reporting | qa-intelligence | Existing |
| Release Theme Generation         | cleo-test-management-reporting | qa-intelligence | Existing |
| Stakeholder Narrative Generation | cleo-test-management-reporting | qa-intelligence | Existing |
| Release Comparison               | cleo-test-management-reporting | qa-intelligence | Existing |
| Release Packaging                | cleo-test-management-reporting | qa-intelligence | Existing |
| Release Bundling                 | cleo-test-management-reporting | qa-intelligence | Existing |

---

## Publishing

Purpose:

```text
Publish results and release information.
```

| Capability                | Current Package                | Future Package  | Status   |
| ------------------------- | ------------------------------ | --------------- | -------- |
| Jira Publishing           | cleo-test-management-reporting | qa-intelligence | Existing |
| Dashboard Publishing      | cleo-test-management-reporting | qa-intelligence | Existing |
| Attachment Publishing     | cleo-test-management-reporting | qa-intelligence | Existing |
| Release Bundle Publishing | cleo-test-management-reporting | qa-intelligence | Existing |

---

# Application Capabilities

## Runtime & Configuration

| Capability                 | Current Package                | Future Owner | Status   |
| -------------------------- | ------------------------------ | ------------ | -------- |
| CLI Entry Point            | cleo-test-management-reporting | Application  | Existing |
| Command Registration       | cleo-test-management-reporting | Application  | Existing |
| Runtime Context Management | cleo-test-management-reporting | Application  | Existing |
| Configuration Management   | cleo-test-management-reporting | Application  | Existing |
| Environment Management     | cleo-test-management-reporting | Application  | Existing |

---

## Workflow Orchestration

| Capability                    | Current Package                | Future Owner | Status   |
| ----------------------------- | ------------------------------ | ------------ | -------- |
| Pipeline Execution            | cleo-test-management-reporting | Application  | Existing |
| Phase 1 Workflow              | cleo-test-management-reporting | Application  | Existing |
| Phase 2 Workflow              | cleo-test-management-reporting | Application  | Existing |
| Phase 3 Workflow              | cleo-test-management-reporting | Application  | Existing |
| Artifact Acquisition Workflow | cleo-test-management-reporting | Application  | Existing |
| Codemod Workflow              | cleo-test-management-reporting | Application  | Existing |

---

# Strategic Gaps

The following capabilities do not currently exist but align strongly with the future architecture.

| Capability                       | Future Product | Priority |
| -------------------------------- | -------------- | -------- |
| Requirement Domain Model         | Shared Domain  | High     |
| Acceptance Criteria Domain Model | Shared Domain  | High     |
| Test Case Domain Model           | Shared Domain  | High     |
| Traceability Model               | Shared Domain  | High     |
| Requirement Traceability         | Shared Domain  | High     |
| Feature → Cypress Generator      | QA Automation  | High     |
| Gherkin → Cypress Generator      | QA Automation  | High     |
| Domain Roundtrip Validation      | QA Automation  | Medium   |
| Playwright Adapter               | QA Automation  | Low      |
| Azure DevOps Adapter             | QA Automation  | Low      |

---

# Migration Candidates

## Future qa-core

```text
Feature
Scenario
Step
Requirement
AcceptanceCriteria
TestCase
Traceability
Shared Contracts
```

---

## Future qa-automation

```text
Requirement Extraction
Acceptance Criteria Analysis
Scenario Building
Feature Generation
BDD Generation
Cypress Parsing
Cypress Generation
Codemods
```

---

## Future qa-intelligence

```text
Git Analysis
Delivery Intelligence
Release Intelligence
Results Aggregation
Reporting
Publishing
Dashboards
Narratives
Metrics
```

---

# Summary

The platform currently contains two emerging products:

```text
QA Automation
```

Responsible for:

```text
Requirements
Acceptance Criteria
Features
Scenarios
BDD
Cypress
Automation Assets
```

and

```text
QA Intelligence
```

Responsible for:

```text
Delivery Analysis
Quality Analysis
Reporting
Release Intelligence
Publishing
```

supported by a future shared domain:

```text
qa-core
```

which becomes the canonical home for all business testing concepts.
