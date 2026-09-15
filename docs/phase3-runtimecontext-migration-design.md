# Phase 3 RuntimeContext Migration Design

## Purpose

This document defines how Phase 3 will migrate away from raw Commander options.

The goal is to replace:

```ts
runPhase3Workflow(opts);
```

with:

```ts
runPhase3Workflow(runtimeContext, publishOptions);
```

while maintaining identical behaviour.

The migration should be:

- Incremental
- Backwards compatible
- Testable
- Reversible

---

# Background

Phase 1 and Phase 2 have already been integrated with RuntimeContext.

Current execution flow:

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
```

Phase 3 remains the final consumer of raw Commander options.

---

# Current State

Current implementation:

```ts
runPhase3(opts);
```

↓

```ts
runPhase3Workflow(opts);
```

Phase 3 directly accesses Commander-derived values.

---

# Current Dependencies

The workflow currently reads:

```ts
opts.version;

opts.releaseKeys;

opts.publish;

opts.jira;

opts.attachSummary;

opts.attachReleaseNotes;
```

These values are currently mixed across:

- Execution concerns
- Publishing concerns

---

# Responsibility Separation

## RuntimeContext

RuntimeContext represents execution state.

Examples:

```ts
version;

environment;

source;

runId;

releaseKeys;
```

These describe the execution.

---

## PublishOptions

PublishOptions represents publishing decisions.

Examples:

```ts
publish;

jiraKey;

attachSummary;

attachReleaseNotes;
```

These describe how output should be published.

---

# Target Architecture

Current:

```text
runPhase3Workflow(opts)
```

Future:

```text
runPhase3Workflow(
    runtimeContext,
    publishOptions,
)
```

Dependencies become explicit.

---

# Mapping

## Current

```ts
opts.version;
```

Future:

```ts
runtimeContext.version;
```

---

## Current

```ts
opts.releaseKeys;
```

Future:

```ts
runtimeContext.releaseKeys;
```

---

## Current

```ts
opts.publish;
```

Future:

```ts
publishOptions.publish;
```

---

## Current

```ts
opts.jira;
```

Future:

```ts
publishOptions.jiraKey;
```

---

## Current

```ts
opts.attachSummary;
```

Future:

```ts
publishOptions.attachSummary;
```

---

## Current

```ts
opts.attachReleaseNotes;
```

Future:

```ts
publishOptions.attachReleaseNotes;
```

---

# Proposed Signature

Current:

```ts
export async function runPhase3Workflow(opts: any);
```

Future:

```ts
export async function runPhase3Workflow(
  runtimeContext: RuntimeContext,
  publishOptions: PublishOptions,
);
```

---

# Migration Strategy

## Step 1

Add new parameters.

```ts
runPhase3Workflow(runtimeContext, publishOptions);
```

Retain existing behaviour.

---

## Step 2

Replace version lookup.

Current:

```ts
let version = opts.version || getConfig().release.version;
```

Future:

```ts
let version = runtimeContext.version;
```

Configuration fallback already resolved by RuntimeContextBuilder.

---

## Step 3

Replace release notes generation.

Current:

```ts
if (opts.version)
```

Future:

```ts
if (runtimeContext.version)
```

---

Current:

```ts
opts.releaseKeys;
```

Future:

```ts
runtimeContext.releaseKeys;
```

---

## Step 4

Replace publishing logic.

Current:

```ts
opts.publish;
```

Future:

```ts
publishOptions.publish;
```

---

Current:

```ts
opts.jira;
```

Future:

```ts
publishOptions.jiraKey;
```

---

Current:

```ts
opts.attachSummary;
```

Future:

```ts
publishOptions.attachSummary;
```

---

Current:

```ts
opts.attachReleaseNotes;
```

Future:

```ts
publishOptions.attachReleaseNotes;
```

---

## Step 5

Remove Commander dependency.

Delete:

```ts
opts;
```

from Phase 3.

Phase 3 becomes completely independent from Commander.

---

# Example Local Run

Command:

```bash
npm run cleo -- pipeline --phase3
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

PublishOptions:

```ts
{
  publish: false;
}
```

Phase 3 executes normally.

---

# Example Publish Run

Command:

```bash
npm run cleo -- pipeline \
  --phase3 \
  --publish \
  --jira EVA-123 \
  --attach-summary \
  --attach-release-notes
```

RuntimeContext:

```ts
{
  source: "local",
  version: "26.14.0",
  environment: "Staging"
}
```

PublishOptions:

```ts
{
  publish: true,
  jiraKey: "EVA-123",
  attachSummary: true,
  attachReleaseNotes: true
}
```

Phase 3 publishes using PublishOptions.

---

# Future CI/CD Example

GitHub Actions:

```yaml
- name: Generate Reports
  run: |
    npm run cleo -- pipeline \
      --phase3 \
      --publish \
      --jira ${{ inputs.jiraKey }}
```

Produces:

```text
RuntimeContext
        +
PublishOptions
```

without exposing Commander objects beyond the CLI layer.

---

# Success Criteria

- RuntimeContext supplies execution values.
- PublishOptions supplies publishing values.
- Phase 3 no longer depends on Commander.
- Configuration fallback remains centralized.
- Local execution remains supported.
- CI/CD execution remains supported.
- Publishing behaviour remains unchanged.
- Existing outputs remain unchanged.
