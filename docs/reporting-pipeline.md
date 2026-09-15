# CLEO Test Management Reporting Pipeline

## Purpose

Defines the end-to-end reporting platform.

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

# Pipeline Overview

```text
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

# Current CLI Mapping

Current implementation:

```bash
npm run cleo -- pipeline --phase1
```

Meaning:

```text
Prepare Specifications
```

---

```bash
npm run cleo -- pipeline --phase2
```

Meaning:

```text
Build Results
```

---

```bash
npm run cleo -- pipeline --phase3
```

Meaning:

```text
Generate Reports
```

---

# Acquire Results

Purpose:

Acquire and normalise test evidence.

Local:

```bash
npm run cleo -- acquire-results
```

CI/CD:

```yaml
- name: Acquire Results
  run: |
    npm run cleo -- acquire-results \
      --runId ${{ inputs.runId }}
```

---

# Prepare Specifications

Current Command:

```bash
npm run cleo -- pipeline --phase1
```

Purpose:

- Validate Cypress specifications
- Execute codemod
- Generate transformed specifications

Outputs:

- Codemod reports
- Validation outputs

---

# Build Results

Current Command:

```bash
npm run cleo -- pipeline --phase2
```

Purpose:

- Manual transform
- Automated transform
- Cypress metadata extraction
- Aggregation
- Execution reporting

Outputs:

```text
complete-test-results.json
execution reports
excel reports
```

---

# Generate Reports

Current Command:

```bash
npm run cleo -- pipeline --phase3
```

Purpose:

- Release notes
- Test summary report
- Bug metrics
- Release documentation

Outputs:

```text
release-notes.docx
test-summary-report.docx
bug-summary.json
bug-metrics.json
```

---

# Publish Reports

Future command:

```bash
npm run cleo -- publish-reports
```

Purpose:

- Jira publication
- Attachments
- Distribution

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

      - name: Prepare Specifications
        run: npm run cleo -- pipeline --phase1

      - name: Build Results
        run: npm run cleo -- pipeline --phase2

      - name: Generate Reports
        run: |
          npm run cleo -- pipeline \
            --phase3 \
            --version ${{ inputs.version }}
```

---

# Success Criteria

- Local execution supported
- GitHub execution supported
- Publish separated from reporting
- Pipeline terminology standardised
