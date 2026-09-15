# Acquire Results

## Purpose

Acquire Results is responsible for acquiring all test execution results required by the reporting platform.

The goal is to ensure that downstream processing receives data in a consistent format regardless of result source.

Supported sources:

- Local workstation execution
- GitHub workflow artifacts
- Future external execution systems

---

# Terminology

| Legacy Name | Canonical Name  |
| ----------- | --------------- |
| Phase 0     | Acquire Results |

---

# Design Principle

Acquire Results acts as the adapter boundary between test execution systems and the reporting platform.

Downstream stages must never need to understand:

- GitHub workflow runs
- Artifact naming conventions
- Repository ownership
- Artifact storage mechanisms

Output from Acquire Results must be identical regardless of source.

---

# Responsibilities

Acquire Results is responsible for:

1. Acquiring test results
2. Downloading GitHub artifacts
3. Extracting ZIP archives
4. Normalising artifact structures
5. Preparing reporting inputs

Acquire Results is not responsible for:

- Codemods
- Specification preparation
- Report generation
- Publishing
- Jira operations

---

# Local Example

```bash
npm run cleo -- acquire-results
```

Source:

```text
testResults/
├── backend
├── frontend
├── cypress
└── manual
```

---

# CI/CD Example

```yaml
- name: Acquire Results
  run: |
    npm run cleo -- acquire-results \
      --runId ${{ inputs.runId }}
```

---

# GitHub Artifact Mode

```bash
npm run cleo -- acquire-results \
  --runId 3352052064
```

Result:

```text
testResults/
└── github/
    └── 3352052064/
```

---

# Artifact Contract

## backend-unit

Expected files:

```text
test-results.json
test-summary.json
```

## backend-integration

Expected files:

```text
integration-summary.json
```

## frontend

Expected files:

```text
coverage-summary.json
```

## cypress

Expected files:

```text
mochawesome.json
summary.json
summary.md
videos/*
```

---

# Validation

- Artifacts located
- Downloads completed
- Archives extracted
- Expected files discovered

---

# Failure Recovery

Acquire Results can be executed repeatedly using the same GitHub Run ID without rerunning tests.

```bash
npm run cleo -- acquire-results \
  --runId 3352052064
```

---

# Success Criteria

- Local mode supported
- GitHub Artifact mode supported
- Result structure normalized
- Downstream stages remain source agnostic
