# Pipeline Command Options Design

## Purpose

This document defines the command-line contract for the reporting pipeline.

The goal is to separate:

- CLI specific options
- Pipeline execution inputs
- Runtime execution context

into distinct models with clear responsibilities.

---

# Background

The current pipeline command is implemented using Commander.

Example:

```bash
npm run cleo -- pipeline --phase3 --publish --jira EVA-123
```

Commander produces a raw options object which is currently passed directly into parts of the application.

This approach couples:

- CLI concerns
- Execution concerns
- Reporting concerns

into a single object.

As the reporting platform evolves, these concerns should be separated.

---

# Design Principles

## Principle 1

The CLI layer should own command parsing.

Pipeline services should not understand Commander.

---

## Principle 2

Pipeline control options are different from execution options.

Example:

```text
phase1
phase2
phase3
all
```

control the pipeline.

They do not describe a release.

---

## Principle 3

Execution options describe a reporting execution.

Examples:

```text
version
runId
environment
publish
jiraKey
```

These values describe what should be executed.

---

## Principle 4

RuntimeContext should remain isolated from CLI implementation details.

The RuntimeContext should never contain:

```text
phase1
phase2
phase3
all
```

because these are command concerns rather than business concerns.

---

# Current State

Current Commander configuration:

```ts
.option("--phase1")
.option("--phase2")
.option("--phase3")
.option("--all")

.option("--version <name>")
.option("--jira <key>")
.option("--releaseKeys <keys>")
.option("--publish")
```

Produces an object similar to:

```ts
{
  phase1?: boolean;
  phase2?: boolean;
  phase3?: boolean;
  all?: boolean;

  version?: string;

  jira?: string;

  releaseKeys?: string;

  publish?: boolean;
}
```

This object currently mixes multiple responsibilities.

---

# Future State

```text
Commander
       ↓
PipelineCommandOptions
       ↓
PipelineExecutionOptions
       ↓
RuntimeContext
       ↓
Pipeline Services
```

Each model has a single responsibility.

---

# PipelineCommandOptions

PipelineCommandOptions represents raw command-line options.

Example implementation:

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

Characteristics:

- Directly reflects Commander options
- May contain invalid values
- May contain incomplete values
- Not suitable for service execution

---

# PipelineExecutionOptions

PipelineExecutionOptions represents execution inputs extracted from the command layer.

Example:

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

Characteristics:

- Contains execution inputs only
- Removes command-control concerns
- Independent of Commander

---

# RuntimeContext

RuntimeContext represents the fully resolved execution model.

Example:

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

Characteristics:

- Fully validated
- Contains resolved defaults
- Safe for service execution

---

# Transformation Flow

## Step 1

Commander parses arguments.

```bash
npm run cleo -- pipeline \
  --phase3 \
  --publish \
  --jira EVA-123
```

Produces:

```ts
PipelineCommandOptions;
```

---

## Step 2

PipelineCommandOptions is transformed into:

```ts
PipelineExecutionOptions;
```

Example:

```ts
{
  publish: true,
  jiraKey: "EVA-123"
}
```

Pipeline control flags are removed.

---

## Step 3

PipelineExecutionOptions is merged with:

```text
Environment Variables
+
cleo.config.json
```

to build:

```ts
RuntimeContext;
```

---

# Local Example

Command:

```bash
npm run cleo -- pipeline --phase2
```

Commander:

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

RuntimeContext:

```ts
{
  source: "local",
  version: "26.14.0",
  environment: "Staging",
  publish: false
}
```

---

# CI/CD Example

GitHub workflow:

```yaml
- name: Generate Reports
  run: |
    npm run cleo -- pipeline \
      --phase3 \
      --publish \
      --version ${{ inputs.version }}
```

Commander:

```ts
{
  phase3: true,
  publish: true,
  version: "26.15.0"
}
```

PipelineExecutionOptions:

```ts
{
  version: "26.15.0",
  publish: true
}
```

RuntimeContext:

```ts
{
  source: "github",
  version: "26.15.0",
  environment: "Staging",
  publish: true
}
```

---

# Proposed Implementation Sequence

## Step 1

Create:

```text
src/models/pipelineCommandOptions.ts
```

No behavioural changes.

---

## Step 2

Add typing to pipelineCommands.ts.

No behavioural changes.

---

## Step 3

Create translation logic:

```text
PipelineCommandOptions
        ↓
PipelineExecutionOptions
```

---

## Step 4

Create RuntimeContext.

---

## Step 5

Refactor services to consume RuntimeContext.

---

# Success Criteria

- CLI concerns are separated from execution concerns.
- Pipeline services no longer depend on Commander.
- RuntimeContext remains independent from CLI implementation details.
- Local execution remains supported.
- CI/CD execution remains supported.
- Future GitHub workflows use the same execution model.
