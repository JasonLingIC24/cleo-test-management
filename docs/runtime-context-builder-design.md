# Runtime Context Builder Design

## Purpose

This document defines how a RuntimeContext is created for pipeline execution.

The RuntimeContext represents the fully resolved execution state for a reporting run.

Its purpose is to ensure that all execution stages operate using a single, validated and source-independent model.

---

# Background

The reporting platform now defines three execution layers:

```text
PipelineCommandOptions
          ↓
PipelineExecutionOptions
          ↓
RuntimeContext
```

Each layer has a specific responsibility.

PipelineCommandOptions represents raw command-line input.

PipelineExecutionOptions represents execution inputs extracted from command options.

RuntimeContext represents the final execution model used by services.

---

# Terminology

| Layer                    | Responsibility                 |
| ------------------------ | ------------------------------ |
| PipelineCommandOptions   | Raw CLI options                |
| PipelineExecutionOptions | Execution inputs               |
| RuntimeContext           | Fully resolved execution model |

---

# Design Principles

## Principle 1

Pipeline services should consume RuntimeContext.

Services should never:

- Read Commander options
- Parse environment variables
- Access configuration directly for execution values

---

## Principle 2

RuntimeContext should be complete.

All required execution values should be resolved before execution begins.

Pipeline stages should not need fallback logic.

---

## Principle 3

RuntimeContext should be source agnostic.

Pipeline stages should not need to know whether values came from:

- CLI
- Environment variables
- GitHub workflow inputs
- Configuration

---

## Principle 4

RuntimeContext should support both local and CI/CD execution.

The same RuntimeContext structure should be used everywhere.

---

# Runtime Context

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

---

# RuntimeContextBuilder Responsibility

The builder constructs RuntimeContext from:

```text
PipelineExecutionOptions
+
Environment Variables
+
cleo.config.json
```

Result:

```text
RuntimeContext
```

---

# Resolution Order

The builder should use the following precedence order.

## Priority 1

PipelineExecutionOptions

Examples:

```text
version
runId
publish
jiraKey
releaseKeys
```

Values supplied directly by the current execution.

---

## Priority 2

Environment Variables

Examples:

```text
CTM_VERSION

CTM_ENVIRONMENT

CTM_RUN_ID

CTM_PUBLISH

CTM_JIRA_KEY
```

Typically used in CI/CD environments.

---

## Priority 3

cleo.config.json

Examples:

```text
release.version
release.environment

github.owner
github.repo
```

Used as default values.

---

# Source Resolution

## Local Mode

Detection:

```text
runId undefined
```

Produces:

```ts
source: "local";
```

Example:

```bash
npm run cleo -- pipeline --phase2
```

---

## GitHub Mode

Detection:

```text
runId present
```

Produces:

```ts
source: "github";
```

Example:

```bash
npm run cleo -- acquire-results \
  --runId 3352052064
```

---

# Local Execution Example

## Command

```bash
npm run cleo -- pipeline --phase3
```

## PipelineExecutionOptions

```ts
{
}
```

## Environment Variables

```text
None
```

## Config

```json
{
  "release": {
    "version": "26.15.0",
    "environment": "Staging"
  }
}
```

## RuntimeContext

```ts
{
  source: "local",

  version: "26.15.0",

  environment: "Staging",

  publish: false
}
```

---

# Local Override Example

## Command

```bash
npm run cleo -- pipeline \
  --phase3 \
  --version 26.16.0
```

## PipelineExecutionOptions

```ts
{
  version: "26.16.0";
}
```

## RuntimeContext

```ts
{
  source: "local",

  version: "26.16.0",

  environment: "Staging",

  publish: false
}
```

CLI value overrides configuration.

---

# CI/CD Example

## Workflow

```yaml
workflow_dispatch:
  inputs:
    version:
    runId:
```

## Command

```bash
npm run cleo -- pipeline \
  --phase3 \
  --version 26.16.0 \
  --publish
```

## PipelineExecutionOptions

```ts
{
  version: "26.16.0",

  publish: true
}
```

## Environment Variables

```text
CTM_ENVIRONMENT=UAT
```

## RuntimeContext

```ts
{
  source: "github",

  version: "26.16.0",

  environment: "UAT",

  publish: true
}
```

---

# Configuration Mapping

## Remains Static

Current CleoConfig values:

```text
paths
templates
reports
product
owners

jira.baseUrl
jira.projectKey
jira.boardId

github.owner
github.repo
```

Remain configuration concerns.

---

## Runtime Values

Current CleoConfig values:

```text
release.version
release.environment
release.buildNumber
```

Should eventually migrate into runtime resolution.

---

# Validation Rules

## Version

Required for:

```text
Generate Reports
Publish Reports
```

---

## Environment

Must always resolve.

If missing:

```text
Fail Fast
```

---

## Publish

Defaults to:

```ts
false;
```

if not supplied.

---

## Release Keys

Must be:

```ts
string[]
```

when present.

---

# Proposed Builder API

Location:

```text
src/builders/runtimeContextBuilder.ts
```

Example:

```ts
buildRuntimeContext(
  executionOptions: PipelineExecutionOptions
): RuntimeContext
```

---

# Future Integration

## pipelineCommands.ts

Future execution flow:

```text
Commander
        ↓
PipelineCommandOptions
        ↓
PipelineExecutionOptionsBuilder
        ↓
PipelineExecutionOptions
        ↓
RuntimeContextBuilder
        ↓
RuntimeContext
        ↓
Pipeline Services
```

---

# Implementation Plan

## Step 1

Create:

```text
RuntimeContext
```

Model only.

No behaviour changes.

---

## Step 2

Create:

```text
RuntimeContextBuilder
```

No integration.

---

## Step 3

Unit-test precedence rules.

---

## Step 4

Integrate into pipelineCommands.ts.

---

## Step 5

Refactor services to consume RuntimeContext.

---

# Success Criteria

- One execution model exists for the platform.
- Local execution remains supported.
- CI/CD execution remains supported.
- Runtime values are resolved consistently.
- Services do not depend on Commander.
- Services do not depend on environment variable parsing.
- Future GitHub reporting workflows use the same RuntimeContext contract.
