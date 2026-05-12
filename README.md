# build (once)#npm run build -w cleo-cypress-codemod
npm run build -w cleo-test-management-reporting

# go to CLI package
cd packages/cleo-test-management-reporting

# dry run
node dist/cli/index.js codemod run \
  --input ../../input/tests \
  --domain-root ../../input/tests \
  --dry-run

# output directory mode (best)
node dist/cli/index.js codemod run \
  --input ../../input/tests \
  --domain-root ../../input/tests \
  --out-dir ../../out/tests

# in-place write (only if confident)
node dist/cli/index.js codemod run \
  --input ../../input/tests \
  --domain-root ../../input/tests \
  --write

✅ Mental model (this helps a lot)

cleo-cypress-codemod → does analysis & transforms (no I/O)
cleo-test-management-reporting → CLI + filesystem effects
You run the compiled JS, not TS
Node is the entrypoint, not npm

Once this clicks, everything else feels straightforward.

