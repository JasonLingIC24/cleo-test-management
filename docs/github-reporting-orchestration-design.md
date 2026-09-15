# GitHub Reporting Orchestration Design

## Purpose

Define repository ownership and end-to-end orchestration across:

- elevate-monorepo
- cleo-test-management

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

# Repository Ownership

## elevate-monorepo

Owns:

- Application
- Test suites
- Deployment
- Workflow execution
- Artifact generation
- Releases

### Workflow

Manual Full Test Suite

Outputs:

- backend-unit
- backend-integration
- frontend
- cypress

---

## cleo-test-management

Owns:

- Acquire Results
- Prepare Specifications
- Build Results
- Generate Reports
- Publish Reports

Outputs:

- JSON
- Excel
- DOCX
- Jira Updates

---

# End To End Flow

```text
Manual Full Test Suite
          │
          ▼
Workflow Run
          │
          ▼
Artifacts Produced
          │
          ▼
Acquire Results
          │
          ▼
Prepare Specifications
          │
          ▼
Build Results
          │
          ▼
Generate Reports
          │
          ▼
Publish Reports
```

---

# Local Example

```bash
npm run cleo -- pipeline --all
```

---

# CI/CD Example

```yaml
jobs:
  reporting:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Acquire Results
        run: |
          npm run cleo -- acquire-results \
            --runId ${{ inputs.runId }}

      - name: Build Results
        run: npm run cleo -- pipeline --phase2

      - name: Generate Reports
        run: |
          npm run cleo -- pipeline \
            --phase3 \
            --version ${{ inputs.version }}
```

---

# Failure Recovery

## Re-run Reporting

```text
Existing Artifacts
        ↓
Acquire Results
        ↓
Build Results
        ↓
Generate Reports
```

## Re-run Publication

```text
Existing Reports
        ↓
Publish Reports
```

## Regenerate Documentation

```text
Existing Results
        ↓
Generate Reports
```

---

# Success Criteria

- CI/CD supported
- Local execution supported
- Reporting independent from test execution
- Reports reproducible from a Run ID
