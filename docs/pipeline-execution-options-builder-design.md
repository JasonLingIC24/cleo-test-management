# Pipeline Execution Options Builder Design

## Purpose

This document defines how command-line options are transformed into execution options.

The goal is to separate:

- User command inputs
- Pipeline execution inputs
- Runtime execution context

into distinct layers.

---

# Background

The reporting platform currently receives raw options from Commander.

Example:

```bash
npm run cleo -- pipeline \
  --phase3 \
  --publish \
  --jira EVA-123
```

Commander produces an object containing both:

- Pipeline control options
- Execution input values

These concerns should be separated before execution begins.

---

# Terminology

| Layer                    | Responsibility                |
| ------------------------ | ----------------------------- |
| PipelineCommandOptions   | Raw CLI command options       |
| PipelineExecutionOptions | Execution inputs              |
| RuntimeContext           | Fully resolved runtime values |

---

# Design Principles

## Principle 1

Pipeline services should never consume raw Commander options.

Only the command layer should understand Commander.

---

## Principle 2

Pipeline control flags must not leak into execution models.

Examples:

```text
phase1
phase2
phase3
all
```

These control pipeline flow.

They are not execution values.

---

## Principle 3

Execution options should contain only information required to execute work.

Examples:

```text
version
environment
runId
publish
jiraKey
releaseKeys
```

---

## Principle 4

The builder should be deterministic.

The same command options should always generate the same execution options.

---

# Current Models

## PipelineCommandOptions

```ts
export interface PipelineCommandOptions {
  phase1?: boolean;

  phase2?: boolean;

  phase3?: boolean;

  all?: boolean;

  version?: string;

  jira?: string;

  releaseKeys?: string;

  publish?: boolean;

  attachSummary?: boolean;

  attachReleaseNotes?: boolean;
}
```

---

## PipelineExecutionOptions

```ts
export interface PipelineExecutionOptions {
  version?: string;

  environment?: string;

  runId?: number;

  publish?: boolean;

  jiraKey?: string;

  releaseKeys?: string[];
}
```

---

# Builder Responsibility

The builder transforms:

```text
PipelineCommandOptions
          ↓
PipelineExecutionOptions
```

Pipeline control values are discarded.

Execution values are normalised.

---

# Transformation Rules

## Version

Input:

```ts
{
  version: "26.15.0";
}
```

Output:

```ts
{
  version: "26.15.0";
}
```

---

## Jira Key

Input:

```ts
{
  jira: "EVA-123";
}
```

Output:

```ts
{
  jiraKey: "EVA-123";
}
```

Rule:

```text
jira → jiraKey
```

to align with the RuntimeContext model.

---

## Publish

Input:

```ts
{
  publish: true;
}
```

Output:

```ts
{
  publish: true;
}
```

No transformation required.

---

## Release Keys

Input:

```ts
{
  releaseKeys: "EVA-123,EVA-124,EVA-125";
}
```

Output:

```ts
{
  releaseKeys: ["EVA-123", "EVA-124", "EVA-125"];
}
```

Rule:

```text
Comma-separated string
            ↓
trim
            ↓
string[]
```

---

# Ignored Fields

The following fields are intentionally removed:

```ts
phase1;
phase2;
phase3;
all;
attachSummary;
attachReleaseNotes;
```

Reason:

These are command-layer concerns.

They are not execution inputs.

---

# Builder Example

Input:

```ts
{
  phase3: true,

  version: "26.15.0",

  jira: "EVA-123",

  releaseKeys: "EVA-100,EVA-101",

  publish: true
}
```

Output:

```ts
{
  version: "26.15.0",

  jiraKey: "EVA-123",

  releaseKeys: [
    "EVA-100",
    "EVA-101"
  ],

  publish: true
}
```

---

# Local Execution Example

Command:

```bash
npm run cleo -- pipeline --phase2
```

PipelineCommandOptions:

```ts
{
  phase2: true;
}
```

PipelineExecutionOptions:

```ts
{
}
```

Result:

```text
Execution uses defaults from configuration.
```

---

# CI/CD Example

GitHub Workflow:

```yaml
- name: Generate Reports
  run: |
    npm run cleo -- pipeline \
      --phase3 \
      --version ${{ inputs.version }} \
      --jira ${{ inputs.jiraKey }} \
      --publish
```

PipelineCommandOptions:

```ts
{
  phase3: true,
  version: "26.15.0",
  jira: "EVA-200",
  publish: true
}
```

PipelineExecutionOptions:

```ts
{
  version: "26.15.0",
  jiraKey: "EVA-200",
  publish: true
}
```

---

# Proposed Builder API

Location:

```text
src/builders/pipelineExecutionOptionsBuilder.ts
```

Example:

```ts
buildPipelineExecutionOptions(
  commandOptions: PipelineCommandOptions
): PipelineExecutionOptions
```

---

# Implementation Plan

## Step 1

Create builder file.

No usage changes.

---

## Step 2

Create unit tests.

Validate transformation rules.

---

## Step 3

Integrate into pipelineCommands.ts.

Still no RuntimeContext.

---

## Step 4

Introduce RuntimeContextBuilder.

PipelineExecutionOptions becomes an input to RuntimeContext creation.

---

# Success Criteria

- Commander options remain isolated.
- Pipeline services do not understand Commander.
- Execution inputs are normalised.
- Release key parsing is centralised.
- RuntimeContext can be introduced cleanly in the next phase.
- Local
