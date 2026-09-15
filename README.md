Markdown# 
Cleo Test Management CLI - Full Test ChecklistThis guide walks through a complete end-to-end validation of the Cleo CLI.---# ✅ FULL TEST CHECKLIST (RUN EACH STEP)---## 1️⃣ Inspect (Baseline)```bashcleo inspect --input ./input/cypress/testsShow more lines
✅ Check:

Output appears in terminal
No files written
No errors

✅ Purpose:
Verify parsing works before transformation

2️⃣ Validate (Rules Only)
Shellcleo codemod validate --input ./input/cypress/testsShow more lines
✅ Check:

Passes OR fails correctly
Fails on invalid nested tags
Violations clearly shown

✅ Purpose:
Ensure validator is enforcing rules correctly

3️⃣ Codemod (Safe Run)
Shellcleo codemod run --input ./input/cypress/tests --changed-only``Show more lines
✅ Check:

Files processed count correct
Changed count reasonable
Output folder created

📂 Output location:
./output/codemod

✅ Purpose:
Verify transformation + reporting without modifying originals

4️⃣ Inspect Output Files
Check files in:
output/codemod/

✅ Verify:
✅ Feature wrapper added
Before:
TypeScriptdescribe(...)Show more lines
After:
TypeScriptdescribe("Feature: ...", { tags: [...] })Show more lines

✅ Tags moved correctly

Top-level tags → feature
Nested structural tags → removed
Allowed tags → retained


✅ Domain tagging added
TypeScript@domain:patients@subdomain:meds``Show more lines
✅ Purpose:
Validate AST transformation correctness

5️⃣ JSON Report
Shellcleo codemod run --input ./input/cypress/tests --reportShow more lines
✅ Check file exists:
cleo-codemod-report.json


✅ Example structure:
JSON{  "summary": {    "filesScanned": 90,    "filesChanged": 10,    "timestamp": "..."  },  "files": [    {      "filePath": "...",      "changed": true,      "warnings": [],      "violations": [],      "changes": {        "featureWrapperAdded": true      }    }  ]}Show more lines
✅ Purpose:
Verify machine-readable output (dashboards / CI)

6️⃣ Changed-only Behaviour
Shellcleo codemod run --input ./input/cypress/tests --changed-onlyShow more lines
✅ Expected:

Only modified files written
Output directory contains fewer files

✅ Check:
Shellls output/codemod | wc -lShow more lines

7️⃣ Write Mode (Mutates Files)
Shellcleo codemod run --input ./input/cypress/tests --writeShow more lines
⚠️ WARNING:

This WILL overwrite your original files

✅ Check:

Files updated correctly in source directory

✅ Purpose:
Verify production behaviour

8️⃣ Automated Reports
Shellcleo transform:automated --input ./input/cypress/tests``Show more lines
✅ Check:

Excel report generated
Gherkin output generated


9️⃣ Aggregate Results
Shellcleo aggregate-resultsShow more lines
✅ Check:

Combined results printed
Totals make sense


🔟 Dashboard Generation
Shellcleo dashboardcleo dashboard:htmlShow more lines
✅ Check:

JSON output generated
HTML dashboard renders correctly


1️⃣1️⃣ Execution Report (Excel)
Shellcleo report:execution-excelShow more lines
✅ Check:

Excel report generated
Data correctly populated


1️⃣2️⃣ Tag Extraction
Shellcleo extract:cypress-tags --input ./input/cypress/testsShow more lines
✅ Check:

JSON file created
Tags correctly extracted


✅ BONUS CHECKS

✅ Idempotency
Shellcleo codemod run --input ./input/cypress/testsShow more lines
✅ Expected:
Files changed: 0

👉 Running codemod again should do nothing

✅ Validate After Transform
Shellcleo codemod validate --input ./input/cypress/testsShow more lines
✅ Expected:
Validation passed


✅ FINAL SUCCESS CRITERIA
Everything is working correctly if:
✅ No TypeScript build errors
✅ Codemod transforms are correct
✅ Output files appear in correct directories
✅ JSON report is valid and complete
✅ Changed-only mode works correctly
✅ Validate catches real issues only
✅ Idempotency holds
✅ Reports and dashboards generate correctly

🧠 PRO TIP
Run in this order:
Shell1. cleo inspect2. cleo codemod validate3. cleo codemod run --changed-only4. inspect output files5. cleo codemod run --report6. cleo codemod run --write (only when confident)Show more lines

✅ This ensures:

Safe execution
Clean diffs
CI-ready workflows


---

# ✅ ✅ ✅ NOW YOU’RE GOOD

That file will now:


✅ fully guide testing
✅ help onboarding others
✅ act as QA checklist
✅ be reusable in CI validation

---

If you want next:

👉 I can generate a **script that runs all steps automatically**  
👉 or a **CI pipeline (GitHub Actions / Azure DevOps)**  

Just say 👍

Provide your feedback on BizChat