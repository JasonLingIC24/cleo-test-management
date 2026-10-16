# ADR-001 - Product Boundary Definition & Dependency Model

**Status:** Accepted  
**Date:** 2026-10-16  
**Author:** Jason Ling

---

# Context

The current monorepo (`cleo-test-management`) has evolved significantly beyond its original purpose.

Architectural review identified two distinct capability areas:

1. QA Intelligence
2. QA Automation

Although both capabilities currently exist within a single repository and are delivered through a common CLI, they solve different business problems, serve different users and are likely to evolve independently.

This ADR defines:

- Product boundaries
- Shared domain ownership
- Capability ownership
- Dependency rules
- Future architectural direction

---

# Decision

The platform shall be modelled as two future products supported by a shared domain.

```text
                     Shared Domain
                          │
          ┌───────────────┼───────────────┐
          │                               │
          ▼                               ▼

   QA Automation                 QA Intelligence
```

---

# Product A - QA Intelligence

## Purpose

Provide delivery, quality and release intelligence from software delivery data.

## Primary Questions

```text
What changed?

What was delivered?

What was tested?

What passed?

What failed?

What should stakeholders know?

What should be published?
```

---

## Inputs

```text
Git Repositories
Jira Releases
Jira Issues
Test Results
Build Artifacts
Manual Test Results
```

---

## Outputs

```text
Release Notes
Release Themes
Release Narratives
Test Reports
Quality Metrics
Dashboards
Stakeholder Reports
Published Jira Content
```

---

## Current Implementation

```text
cleo-test-management-reporting
```

---

## Future Repository

```text
qa-intelligence
```

---

## Future Capabilities

```text
Delivery Intelligence
Release Intelligence
Test Intelligence
Quality Metrics
Reporting
Publishing
Pipeline Orchestration
```

---

# Product B - QA Automation

## Purpose

Transform requirements into automation assets.

## Primary Questions

```text
What should we test?

How should we test it?

Can we automate this?

Can automation assets be generated automatically?
```

---

## Inputs

```text
Jira Stories
Requirements
Acceptance Criteria
BDD Specifications
Feature Files
Existing Cypress Tests
```

---

## Outputs

```text
Requirements Models
Feature Files
Scenarios
Test Cases
Cypress Specifications
Automation Assets
Migration Reports
```

---

## Current Implementation

```text
cleo-domain
cleo-test-generator
cleo-cypress-bdd
cleo-cypress-codemod
```

---

## Future Repository

```text
qa-automation
```

---

## Future Capabilities

```text
Requirements Analysis
Acceptance Criteria Analysis
BDD Generation
Feature Generation
Scenario Generation
Cypress Generation
Automation Migration
Automation Standardisation
```

---

# Shared Domain

The shared domain represents technology-agnostic testing concepts.

The shared domain must remain independent of tooling, frameworks, platforms and implementation details.

Current package:

```text
cleo-domain
```

Future package:

```text
qa-core
```

---

# Shared Domain Responsibilities

The shared domain owns:

```text
Requirement
AcceptanceCriteria
Feature
Scenario
Step
TestCase
Traceability
Shared Contracts
Shared Enums
```

---

# Shared Domain Must Not Own

```text
Jira Clients
Git Integrations
Cypress Parsing
Playwright Parsing
Release Analysis
Publishing
CLI Commands
Filesystem Logic
Report Generation
```

---

# Domain Model Vision

## Requirement Domain

```text
Requirement
AcceptanceCriteria
RequirementReference
```

---

## Test Design Domain

```text
Feature
Scenario
Step
Tag
```

---

## Test Execution Domain

```text
TestCase
TestSuite
```

---

## Traceability Domain

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

# Architecture Overview

## QA Intelligence

```text
Git
    ↓

Jira
    ↓

Test Results
    ↓

Analysis
    ↓

Reporting
    ↓

Publishing
```

Outputs:

```text
Release Notes
Dashboards
Metrics
Reports
Stakeholder Intelligence
```

---

## QA Automation

```text
Jira
    ↓

Requirements
    ↓

Acceptance Criteria
    ↓

Features
    ↓

Scenarios
    ↓

Cypress Assets
```

Outputs:

```text
Feature Files
Test Cases
Cypress Specs
Automation Assets
```

---

# Current Package Ownership

## cleo-test-management-reporting

### Purpose

```text
CLI
Pipeline orchestration
Git analysis
Jira analysis
Results aggregation
Reporting
Release notes
Publishing
```

### Future Product

```text
QA Intelligence
```

### Status

```text
KEEP
```

---

## cleo-domain

### Purpose

```text
Shared automation domain model
```

### Future Product

```text
Shared Domain
```

### Future Package

```text
qa-core
```

### Status

```text
KEEP
```

---

## cleo-test-generator

### Purpose

```text
Jira requirement extraction
Acceptance criteria processing
Feature generation
Scenario generation
Test case generation
```

### Future Product

```text
QA Automation
```

### Status

```text
KEEP
```

---

## cleo-cypress-bdd

### Purpose

```text
Cypress parsing
BDD extraction
Domain conversion
```

### Future Product

```text
QA Automation
```

### Status

```text
KEEP
```

---

## cleo-cypress-codemod

### Purpose

```text
Codemods
AST transformations
Migration tooling
Automation standardisation
```

### Future Product

```text
QA Automation
```

### Status

```text
KEEP
```

---

# Capability Mapping

# QA Intelligence

| Capability                   | Current Package                | Future Owner    |
| ---------------------------- | ------------------------------ | --------------- |
| CLI                          | cleo-test-management-reporting | QA Intelligence |
| Pipeline Orchestration       | cleo-test-management-reporting | QA Intelligence |
| Runtime Context Management   | cleo-test-management-reporting | QA Intelligence |
| Artifact Acquisition         | cleo-test-management-reporting | QA Intelligence |
| Git Analysis                 | cleo-test-management-reporting | QA Intelligence |
| Commit Analysis              | cleo-test-management-reporting | QA Intelligence |
| Commit Classification        | cleo-test-management-reporting | QA Intelligence |
| Change Analysis              | cleo-test-management-reporting | QA Intelligence |
| Jira Release Analysis        | cleo-test-management-reporting | QA Intelligence |
| Jira Version Analysis        | cleo-test-management-reporting | QA Intelligence |
| Jira Sprint Analysis         | cleo-test-management-reporting | QA Intelligence |
| Jira Dashboard Generation    | cleo-test-management-reporting | QA Intelligence |
| Jira Correlation             | cleo-test-management-reporting | QA Intelligence |
| Release Correlation          | cleo-test-management-reporting | QA Intelligence |
| Release Narrative Generation | cleo-test-management-reporting | QA Intelligence |
| Release Theme Generation     | cleo-test-management-reporting | QA Intelligence |
| Results Aggregation          | cleo-test-management-reporting | QA Intelligence |
| Manual Results Processing    | cleo-test-management-reporting | QA Intelligence |
| Execution Reporting          | cleo-test-management-reporting | QA Intelligence |
| Test Summary Reporting       | cleo-test-management-reporting | QA Intelligence |
| Bug Metrics Reporting        | cleo-test-management-reporting | QA Intelligence |
| Release Notes Generation     | cleo-test-management-reporting | QA Intelligence |
| Dashboard Publishing         | cleo-test-management-reporting | QA Intelligence |
| Jira Publishing              | cleo-test-management-reporting | QA Intelligence |
| Release Bundle Generation    | cleo-test-management-reporting | QA Intelligence |
| Documentation Generation     | cleo-test-management-reporting | QA Intelligence |

---

# QA Automation

| Capability                  | Current Package      | Future Owner  |
| --------------------------- | -------------------- | ------------- |
| Requirement Extraction      | cleo-test-generator  | QA Automation |
| Jira ADF Parsing            | cleo-test-generator  | QA Automation |
| Jira Description Parsing    | cleo-test-generator  | QA Automation |
| Acceptance Criteria Parsing | cleo-test-generator  | QA Automation |
| Scenario Building           | cleo-test-generator  | QA Automation |
| Feature Generation          | cleo-test-generator  | QA Automation |
| BDD Generation              | cleo-test-generator  | QA Automation |
| Test Case Generation        | cleo-test-generator  | QA Automation |
| Cypress Spec Parsing        | cleo-cypress-bdd     | QA Automation |
| BDD Extraction              | cleo-cypress-bdd     | QA Automation |
| ParsedSpec Modelling        | cleo-cypress-bdd     | QA Automation |
| Feature Mapping             | cleo-domain          | Shared Domain |
| Scenario Mapping            | cleo-domain          | Shared Domain |
| Step Mapping                | cleo-domain          | Shared Domain |
| Cypress Migration           | cleo-cypress-codemod | QA Automation |
| Cypress Standardisation     | cleo-cypress-codemod | QA Automation |
| AST Transformations         | cleo-cypress-codemod | QA Automation |

---

# Dependency Rules

## Purpose

Dependency rules exist to enforce product boundaries and prevent architectural erosion.

---

# Dependency Hierarchy

```text
                ┌─────────────┐
                │   qa-core   │
                └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          │                         │
          ▼                         ▼

   QA Automation            QA Intelligence

          │                         │
          └────────────┬────────────┘
                       │
                       ▼

                  Applications
```

---

# Rule 1

## Shared Domain Depends On Nothing

Current package:

```text
cleo-domain
```

Allowed dependencies:

```text
None
```

Allowed:

```text
Interfaces
Types
Enums
Shared Models
```

Forbidden:

```text
Jira
Git
Cypress
Playwright
Reporting
Publishing
CLI
Filesystem
```

---

# Rule 2

## QA Automation May Depend On Shared Domain

Current packages:

```text
cleo-test-generator
cleo-cypress-bdd
cleo-cypress-codemod
```

Allowed dependency:

```text
qa-core
```

Forbidden dependencies:

```text
QA Intelligence
Reporting
Publishing
Release Analysis
Git Analysis
```

---

# Rule 3

## QA Intelligence May Depend On Shared Domain

Current package:

```text
cleo-test-management-reporting
```

Allowed dependency:

```text
qa-core
```

Forbidden dependencies:

```text
Automation generation
Cypress generation
Codemods
BDD generation
```

---

# Rule 4

## QA Intelligence Must Not Depend On QA Automation

Target state:

```text
QA Intelligence
        ✖
QA Automation
```

Reason:

QA Intelligence consumes information.

QA Automation creates automation assets.

---

# Rule 5

## QA Automation Must Not Depend On QA Intelligence

Target state:

```text
QA Automation
        ✖
QA Intelligence
```

Reason:

Automation generation must remain independent from reporting concerns.

---

# Rule 6

## Adapters Depend On Domain

Preferred:

```text
Jira Adapter
        ↓
qa-core

Cypress Adapter
        ↓
qa-core

Gherkin Adapter
        ↓
qa-core
```

Avoid:

```text
Jira Adapter
        ↓
Cypress Adapter

Cypress Adapter
        ↓
Jira Adapter
```

---

# Rule 7

## Domain Translation Happens Once

Preferred:

```text
Cypress
        ↓

ParsedSpec
        ↓

Feature
Scenario
Step
```

Avoid:

```text
Feature
        ↓
Another Feature
        ↓
Report Feature
```

Every business concept should have a single canonical representation.

---

# Rule 8

## Applications Own Orchestration

Applications may:

```text
Coordinate workflows
Execute pipelines
Call services
Manage CLI behaviour
```

Applications must not:

```text
Become the source of truth for domain models
Duplicate business entities
Own reusable business rules
```

---

# Dependency Matrix

```text
                                 Depends On

                     qa-core   QA Automation   QA Intelligence

qa-core                ✅            ❌               ❌

QA Automation          ✅            ✅               ❌

QA Intelligence        ✅            ❌               ✅

Applications           ✅            ✅               ✅
```

---

# Transitional Dependencies

The following dependencies currently exist and are accepted until repository separation occurs:

```text
cleo-test-management-reporting
    ↓
cleo-test-generator

cleo-test-management-reporting
    ↓
cleo-cypress-bdd

cleo-test-management-reporting
    ↓
cleo-cypress-codemod
```

These dependencies should be reviewed during a future extraction of QA Automation into its own repository.

---

# Architecture Principles

## Principle 1

```text
Domain First
```

Business concepts must exist independently of tooling.

---

## Principle 2

```text
Adapters Surround The Domain
```

Jira, Cypress and future integrations translate to and from the domain model.

---

## Principle 3

```text
Applications Orchestrate
```

Applications coordinate workflows but do not own business concepts.

---

## Principle 4

```text
Products Own Capabilities
```

Capabilities belong to either:

```text
QA Automation
```

or

```text
QA Intelligence
```

not both.

---

# Immediate Actions

1. Keep existing repository structure unchanged.
2. Keep all existing packages.
3. Continue expanding `cleo-domain` as the shared domain model.
4. Move shared business concepts into the domain package.
5. Create a Target Architecture v2 before any package renaming.
6. Defer repository splitting until capability ownership stabilises.
7. Treat current package names as implementation details rather than architectural boundaries.

---

# Outcome

The platform is formally recognised as two future products:

```text
QA Intelligence
```

and

```text
QA Automation
```

supported by a shared testing domain:

```text
qa-core
```

All future architectural decisions should align to these boundaries.
`
