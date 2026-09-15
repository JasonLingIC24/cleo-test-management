# Runtime Context Integration Design

## Purpose

This document defines how RuntimeContext will be introduced into the reporting pipeline.

The goal is to integrate RuntimeContext without introducing behavioural changes and without requiring a large-scale refactor.

The migration should be:

- Incremental
- Reversible
- Testable
- Backwards compatible

---

# Background

The reporting platform now contains the following execution models:

```text
PipelineCommandOptions
          ↓
PipelineExecutionOptions
          ↓
RuntimeContext
```

and the following builders:

```text
PipelineExecutionOptionsBuilder
RuntimeContextBuilder
```

These components currently exist but are not integrated into pipeline execution.

Current pipeline services continue to operate exactly as they did before.

---

# Current State

Current execution flow:

```text
Commander
        ↓
pipelineCommands.ts
        ↓
runPhase1()
runPhase2()
runPhase3()
```

Runtime values are obtained through:

```text
cleo.config.json
```

and direct access within service implementations.

---

# Future State

Target execution flow:

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

The RuntimeContext becomes the single execution model for the platform.

---

# Design Principles

## Principle 1

Create RuntimeContext once.

The RuntimeContext should be built at the command boundary.

Pipeline services should not build their own RuntimeContexts.

---

## Principle 2

Pass RuntimeContext downstream.

Services should receive RuntimeContext rather than resolving execution values directly.

---

## Principle 3

Maintain backwards compatibility.

No behaviour should change during initial integration.

All existing commands must continue to function.

---

## Principle 4

Integrate incrementally.

Do not refactor every service simultaneously.

Introduce RuntimeContext gradually.

---

# Integration Strategy

The migration should occur in stages.

---

# Stage 1

## Build RuntimeContext

Location:

```text
pipelineCommands.ts
```

Current:

```text
Commander
        ↓
runPhase1()
runPhase2()
runPhase3()
```

Future:

```text
Commander
        ↓
PipelineExecutionOptionsBuilder
        ↓
RuntimeContextBuilder
        ↓
RuntimeContext
```

Important:

RuntimeContext is created but not yet consumed.

No behavioural changes.

---

# Stage 2

## Pass RuntimeContext To Pipeline Services

Current:

```ts
await runPhase1();

await runPhase2();

await runPhase3(opts);
```

Future:

```ts
await runPhase1(runtimeContext);

await runPhase2(runtimeContext);

await runPhase3(runtimeContext);
```

At this stage services may choose to ignore the parameter.

Purpose:

Introduce the dependency boundary.

---

# Stage 3

## Migrate Phase Implementations

Begin replacing:

```ts
getConfig().release.version;
```

with:

```ts
runtimeContext.version;
```

and:

```ts
getConfig().release.environment;
```

with:

```ts
runtimeContext.environment;
```

One service at a time.

No large-scale refactor.

---

# Stage 4

## Remove Direct Runtime Dependencies From Configuration

Execution values should no longer be read directly from:

```text
cleo.config.json
```

within reporting services.

Instead:

```text
RuntimeContext
```

becomes the source of truth.

---

# Proposed RuntimeContext Creation Flow

## Local Execution

Command:

```bash
npm run cleo -- pipeline --phase2
```

Flow:

```text
PipelineCommandOptions
        ↓
{}
        ↓
PipelineExecutionOptions
        ↓
Configuration Defaults
        ↓
RuntimeContext
```

Result:

```ts
{
  source: "local",
  version: "26.15.0",
  environment: "Staging",
  publish: false
}
```

---

## CI/CD Execution

Command:

```bash
npm run cleo -- pipeline \
  --phase3 \
  --version 26.16.0 \
  --publish
```

Flow:

```text
PipelineCommandOptions
        ↓
PipelineExecutionOptions
        ↓
RuntimeContextBuilder
        ↓
RuntimeContext
```

Result:

```ts
{
  source: "local",
  version: "26.16.0",
  environment: "Staging",
  publish: true
}
```

Future GitHub execution:

```ts
{
  source: "github",
  runId: 3352052064,
  version: "26.16.0",
  publish: true
}
```

---

# Backwards Compatibility

The following must remain unchanged during initial integration.

## Commands

```bash
npm run cleo -- pipeline --phase1

npm run cleo -- pipeline --phase2

npm run cleo -- pipeline --phase3

npm run cleo -- pipeline --all
```

---

## Existing Outputs

```text
Execution Reports
Release Notes
Summary Reports
Bug Metrics
```

must remain identical.

---

## Existing Configuration

```text
cleo.config.json
```

remains valid.

No configuration changes required.

---

# RuntimeContext Ownership

RuntimeContext should eventually supply:

```ts
version;

environment;

source;

runId;

publish;

jiraKey;

releaseKeys;
```

to all reporting services.

---

# Services Not To Modify Initially

Do not refactor immediately:

```text
Jira Services

Document Generation

Excel Reporting

Transform Services

Aggregation Services
```

Introduce RuntimeContext first.

Migrate consumers later.

---

# Planned Implementation Sequence

## Step 1

Create RuntimeContext.

✅ Complete

---

## Step 2

Create RuntimeContextBuilder.

✅ Complete

---

## Step 3

Construct RuntimeContext in pipelineCommands.ts.

No behavioural changes.

---

## Step 4

Pass RuntimeContext into:

```text
runPhase1

runPhase2

runPhase3
```

while retaining existing behaviour.

---

## Step 5

Migrate individual services.

Small controlled changes.

---

## Step 6

Remove direct runtime dependencies from configuration.

---

# Success Criteria

- RuntimeContext is constructed once.
- RuntimeContext flows through the pipeline.
- Existing commands continue to work.
- Existing outputs remain unchanged.
- Local execution remains supported.
- CI/CD execution remains supported.
-
