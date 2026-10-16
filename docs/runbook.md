# 1. Generate everything

npm run cleo -- pipeline --all \
--tag v26.20.0 \
--version 26.20.0

# 2. Review

reports/26.20.0/json/release/release-themes.json

# 3. Improve stakeholderNarrative values

# 4. Regenerate release document

npm run cleo -- pipeline --release \
--version 26.20.0

# 5. Publish

npm run cleo -- publish:jira \
--jira EVA-XXXX \
--attach-summary \
--attach-release-notes \
--attach-bundle \
--version 26.20.0
