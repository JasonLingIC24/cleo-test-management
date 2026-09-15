# Pipeline Execution Context Design

## Purpose

Define how runtime values are supplied to the reporting platform.

---

# Terminology

| Legacy Name | Canonical Name         |
| ----------- | ---------------------- |
| Phase 0     | Acquire Results        |
| Phase 1     | Prepare Specifications |
| Phase 2     | Build Results          |
| Phase 3     | Generate Reports       |
| Phase 4     | Publish Reports        |

---

# Current State

Current runtime values originate from:

- cleo.config.json
- CLI arguments
- Environment variables

Execution behaviour is inconsistent across pipeline stages.

---

# Future State

```text
CLI Inputs
        +
Environment Variables
        +
cleo.config.json
        ↓
Execution Context Builder
        ↓
Runtime Context
        ↓
Acquire Results
        ↓
Prepare Specifications
        ↓
Build Results
        ↓
Generate Reports
        ↓
Publish Reports
```

---

# Resolution Order

Priority 1

CLI parameters

Priority 2

Environment variables

Priority 3

cleo.config.json

---

# PipelineExecutionOptions

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

# RuntimeContext

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

# Local Example

```bash
npm run cleo -- pipeline --phase3
```

---

# CI/CD Example

```yaml
workflow_dispatch:
  inputs:
    version:
    environment:
    runId:
```

```bash
npm run cleo -- pipeline \
  --phase3 \
  --version ${{ inputs.version }}
```

---

# Validation Rules

Version required for:

- Generate Reports
- Publishing

RunId required for:

- Acquire Results
- GitHub artifact mode

---

# Success Criteria

- Common runtime model
- External configuration support
- Local execution support
- GitHub execution support
