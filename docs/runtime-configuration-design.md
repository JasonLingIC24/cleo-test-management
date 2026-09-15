# Runtime Configuration Design

## Purpose

Define separation between:

- Static Configuration
- Runtime Configuration
- Secret Configuration

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

# Static Configuration

Stored in:

```text
cleo.config.json
```

Examples:

```text
paths
templates
reports
product
jira
github
```

---

# Runtime Configuration

Provided via:

- CLI
- GitHub Inputs

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

# Secret Configuration

Provided via:

```text
JIRA_EMAIL
JIRA_TOKEN
GITHUB_TOKEN
```

---

# Local Example

```bash
npm run cleo -- pipeline --phase2
```

Meaning:

```text
Build Results
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
npm run cleo -- acquire-results \
  --runId ${{ inputs.runId }}
```

---

# Future Architecture

```text
Release Created
       ↓
Manual Full Test Suite
       ↓
GitHub Artifacts

```
