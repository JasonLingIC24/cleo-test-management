# Acquire Results Integration Design

## Purpose

This document defines how test artifacts will be acquired from GitHub workflow runs and made available to the reporting pipeline.

The objective is to support:

- Local execution
- CI/CD execution
- Future GitHub-based reporting workflows

without requiring changes to existing reporting services.

---

# Background

The reporting platform currently supports:

```text
Phase 1
Validate & Codemod

Phase 2
Transform & Results

Phase 3
Release & Reporting
```

Phase 2 expects artifacts to already exist locally.

Examples:

```text
testResults/backend
testResults/frontend
testResults/cypress
```

The reporting services do not currently download artifacts.

---

# Current State

Current execution flow:

```text
User
  ↓
Pipeline
  ↓
Phase 2
  ↓
Reads local artifacts
```

Assumption:

```text
Artifacts already exist
```

This works for local development but does not support reporting directly from GitHub workflow runs.

---

# Future State

Target flow:

```text
GitHub Workflow
        ↓
Acquire Results
        ↓
Download Artifacts
        ↓
Extract Artifacts
        ↓
Known Locations
        ↓
Phase 2
        ↓
Phase 3
```

Existing reporting services remain unchanged.

---

# Design Principles

## Principle 1

Artifact acquisition should occur before reporting.

Reporting services should not download artifacts.

---

## Principle 2

Artifact acquisition should be independent.

It should be possible to run:

```bash
npm run cleo -- acquire-results
```

without running the reporting pipeline.

---

## Principle 3

Reporting services should remain unaware of GitHub.

They should continue reading:

```text
testResults/backend

testResults/frontend

testResults/cypress
```

---

## Principle 4

RuntimeContext remains the source of execution information.

Acquisition should derive information from RuntimeContext.

---

# RuntimeContext Usage

Current RuntimeContext:

```ts
export interface RuntimeContext {
  source: "local" | "github";

  version: string;

  environment: string;

  owner?: string;

  repo?: string;

  runId?: number;

  publish: boolean;

  jiraKey?: string;

  releaseKeys?: string[];
}
```

Artifact acquisition uses:

```ts
owner;
repo;
runId;
source;
```

No model changes required.

---

# Execution Modes

## Local Mode

Detection:

```ts
runtimeContext.source === "local";
```

Behaviour:

```text
Skip artifact download
```

Assume artifacts already exist.

---

## GitHub Mode

Detection:

```ts
runtimeContext.source === "github";
```

Behaviour:

```text
Download artifacts
Extract artifacts
Prepare reporting inputs
```

---

# New Command

Introduce:

```text
acquire-results
```

Example:

```bash
npm run cleo -- acquire-results \
  --runId 3352052064
```

Purpose:

```text
Download workflow artifacts
```

without executing reporting.

---

# Artifact Acquisition Service

Proposed location:

```text
src/services/artifactAcquisitionService.ts
```

Responsibilities:

```text
GitHub API access
Artifact discovery
Artifact download
Artifact extraction
```

---

# Expected Artifacts

Current reporting logic expects:

```text
backend-unit
backend-integration
frontend
cypress
```

Artifact names should remain unchanged.

---

# Download Targets

Artifacts should be downloaded into:

```text
testResults/backend

testResults/frontend

testResults/cypress
```

The existing reporting services should require no changes.

---

# Acquisition Flow

```text
RuntimeContext
        ↓
ArtifactAcquisitionOptions
        ↓
ArtifactAcquisitionService
        ↓
GitHub API
        ↓
Artifact ZIPs
        ↓
testResults/*
```

---

# GitHub API Requirements

Required:

```text
Repository Owner
Repository Name
Workflow Run ID
GitHub Token
```

Obtained from:

```text
RuntimeContext
Environment Variables
```

Example:

```text
GITHUB_TOKEN
```

---

# Acquisition Validation

The acquisition stage should verify:

```text
Artifacts found
Download successful
Extraction successful
```

Failures should terminate execution early.

---

# Integration Strategy

## Step 1

Create:

```text
ArtifactAcquisitionOptions
```

---

## Step 2

Create:

```text
ArtifactAcquisitionOptionsBuilder
```

---

## Step 3

Create:

```text
artifactAcquisitionService
```

---

## Step 4

Create:

```text
acquire-results command
```

---

## Step 5

Validate manual acquisition.

Example:

```bash
npm run cleo -- acquire-results \
  --runId 3352052064
```

---

## Step 6

Integrate with GitHub Actions.

---

# Future Workflow

```yaml
jobs:
  reporting:
    steps:
      - uses: actions/checkout@v4

      - name: Acquire Results
        run: |
          npm run cleo -- acquire-results \
            --runId ${{ inputs.runId }}

      - name: Build Results
        run: |
          npm run cleo -- pipeline --phase2

      - name: Generate Reports
        run: |
          npm run cleo -- pipeline --phase3
```

---

# Success Criteria

- Local execution remains unchanged.
- GitHub execution is supported.
- Reporting services remain unchanged.
- Artifacts are downloaded automatically.
- RuntimeContext remains the execution source of truth.
- CI/CD reporting becomes fully automated.
