# QA Intelligence - Current State Architecture

## Repository

cleo-test-management

## Purpose

Provides:

- Git analysis
- Jira analysis
- Test analysis
- Release reporting
- Publishing
- Pipeline orchestration

## Packages

- cleo-domain
- cleo-cypress-bdd
- cleo-cypress-codemod
- cleo-test-generator
- cleo-test-management-reporting

## Package Responsibilities

### cleo-domain

Purpose

- Shared entities
- Shared transformations
- Shared utilities

Consumers

- cleo-cypress-bdd
- cleo-test-management-reporting

---

### cleo-cypress-bdd

Purpose

- Parse Cypress specifications
- Extract BDD structure
- Convert tests into domain representations

Consumers

- cleo-test-management-reporting

---

### cleo-cypress-codemod

Purpose

- Cypress migration tooling
- AST transformations
- Test standardisation

Consumers

- cleo-test-management-reporting

---

### cleo-test-generator

Purpose

- Jira requirement extraction
- Feature generation
- Test generation
- BDD generation

Consumers

- cleo-test-management-reporting

---

### cleo-test-management-reporting

Purpose

- CLI
- Workflow orchestration
- Git integration
- Jira integration
- Reporting
- Publishing
- Pipeline execution

## Package Dependency Graph

cleo-domain
▲
│
cleo-cypress-bdd
▲
│
cleo-test-management-reporting
│
├── cleo-cypress-codemod
├── cleo-test-generator
├── cleo-cypress-bdd
└── cleo-domain

## CLI Capabilities

### Codemod

- codemod validate
- codemod run

### Test Transformations

- transform:manual
- transform:automated

### Results Processing

- aggregate-results
- dashboard
- generate:execution-reports

### Release Reporting

- generate:release-notes-from-version
- generate:release-notes-from-keys
- generate:test-summary-report

### Jira Integration

- jira release-data
- jira generate-tests

### Publishing

- publish:jira

### Pipeline

- pipeline --all

## End-to-End Workflow

Phase 1

Git Analysis
Jira Correlation
Release Analysis

↓

Phase 2

Manual Test Processing
Automated Test Processing
Results Aggregation
Execution Reporting

↓

Phase 3

Release Notes
Test Summary Report
Release Bundle

↓

Publishing

## Open Questions

### cleo-domain

Should more models move here?

### cleo-cypress-bdd

Should this remain standalone?

### cleo-test-generator

Is this strategic or legacy?

### cleo-test-management-reporting

Should this remain a single application package?

### Repository

Should cleo-test-management become qa-intelligence?
