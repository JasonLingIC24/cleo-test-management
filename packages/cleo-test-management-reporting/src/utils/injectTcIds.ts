import path from "path";
import { Project, SyntaxKind, Node } from "ts-morph";

export function injectTcIds(
  filePath: string,
  content: string,
): string | undefined {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("temp.ts", content);

  /* ============================================================
     ✅ DERIVE VALUES FROM FILE PATH
  ============================================================ */

  const fileName = path.basename(filePath, path.extname(filePath));
  const featureName = fileName.replace(/\.spec$/, "");

  const upperFeature = featureName.replace(/[^\w]/g, "-").toUpperCase();

  const featureId = `FEATURE-${upperFeature}`; // ✅ for TC IDs + reporting

  const parts =
    filePath.split(`${path.sep}tests${path.sep}`)[1]?.split(path.sep) ?? [];

  let pathParts = [...parts];

  const isVersion = /^\d+\.\d+\.\d+$/.test(pathParts[0] ?? "");

  if (isVersion) {
    pathParts.shift();
  }

  const domainName = pathParts[0] ?? "unknown";
  const subdomainName = pathParts.length > 2 ? pathParts[1] : undefined;

  const domainTag = `@domain:${domainName.toLowerCase()}`;

  const subdomainTag = subdomainName
    ? `@subdomain:${subdomainName.toLowerCase()}`
    : null;

  /* ============================================================
     ✅ ADD TAGS TO describe()
  ============================================================ */

  const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

  // ✅ First pass → describe only
  for (const call of calls) {
    const expression = call.getExpression();

    if (!Node.isIdentifier(expression)) continue;
    if (expression.getText() !== "describe") continue;

    const args = call.getArguments();

    // ✅ STEP 1: ALWAYS REMOVE tcId FIRST

    const objArg = args.find((arg) =>
      Node.isObjectLiteralExpression(arg),
    ) as any;

    if (objArg) {
      const tagsProp = objArg.getProperty("tags");

      if (tagsProp) {
        const initializer = tagsProp.getFirstDescendantByKind(
          SyntaxKind.ArrayLiteralExpression,
        );

        const existingTags: string[] =
          initializer
            ?.getElements()
            .map((e: any) => e.getText().replace(/"/g, "")) ?? [];

        // ✅ Remove ALL existing feature/domain tags
        // ✅ Build final clean tag list
        const baseTags: string[] = existingTags.filter((tag: string) => {
          return !tag.startsWith("@domain:") && !tag.startsWith("@subdomain:");
        });

        const finalTags: string[] = [...baseTags, domainTag];

        if (subdomainTag) {
          finalTags.push(subdomainTag);
        }

        // ✅ Replace entire tags array cleanly
        initializer?.replaceWithText(
          `[${finalTags.map((t: string) => `"${t}"`).join(", ")}]`,
        );
      } else {
        // ✅ No tags property → create one
        objArg.addPropertyAssignment({
          name: "tags",
          initializer: `["${domainTag}"]`,
        });
      }
    } else {
      // ✅ No options object → add one
      call.addArgument(`{ tags: ["${domainTag}"] }`);
    }
    // if (!subdomainTag) {
    //   console.log("No subdomain for:", filePath);
    // }

    break; // ✅ ONLY first describe
  }

  /* ============================================================
     ✅ ADD TC IDs TO EACH it()
  ============================================================ */

  let scenarioIndex = 0;

  // ✅ Second pass → it only
  for (const call of calls) {
    const expression = call.getExpression();

    if (!Node.isIdentifier(expression)) continue;
    if (expression.getText() !== "it") continue;

    const args = call.getArguments();
    if (args.length === 0) continue;

    // ✅ REMOVE tcId if it exists
    if (args.length > 1) {
      const maybeOptions = args[1];

      if (Node.isObjectLiteralExpression(maybeOptions)) {
        const tcIdProp = maybeOptions.getProperty("tcId");

        if (tcIdProp && Node.isPropertyAssignment(tcIdProp)) {
          tcIdProp.remove();

          // ✅ remove object entirely if empty
          if (maybeOptions.getProperties().length === 0) {
            call.removeArgument(1);
          }
        }
      }
    }

    scenarioIndex++;

    const domainShort = domainName.substring(0, 3).toUpperCase();
    const fileShort = abbreviate(featureName);

    const tcId = `${domainShort}-${fileShort}-TC-${String(scenarioIndex).padStart(2, "0")}`;
    const titleArg = args[0];

    // ✅ only process valid title
    if (!titleArg) continue;

    // ✅ get title text
    let titleText = "";

    if (
      Node.isStringLiteral(titleArg) ||
      Node.isNoSubstitutionTemplateLiteral(titleArg)
    ) {
      titleText = titleArg.getLiteralText();
    } else if (Node.isTemplateExpression(titleArg)) {
      titleText = titleArg.getText().replace(/^`|`$/g, "");
    } else if (Node.isBinaryExpression(titleArg)) {
      // ✅ NEW: handle concatenated strings
      titleText = titleArg.getText().replace(/["'`]/g, "");
    } else {
      continue;
    }

    // ✅ NORMALISE WHITESPACE + NEWLINES
    titleText = titleText.trim().replace(/\s+/g, " ");

    // ✅ prevent duplicate injection
    const hasTcAtStart = titleText.trim().startsWith("[");

    if (hasTcAtStart) {
      continue;
    }

    const cleanedTitle = titleText
      .replace(/^\[[^\]]+\]\s*/, "")
      .replace(/`/g, "'"); // prevent breaking template strings

    // ✅ ALWAYS use template string to avoid escaping issues
    titleArg.replaceWithText(`\`[${tcId}] ${cleanedTitle}\``);
  }
  return sourceFile.getFullText();
}

function abbreviate(name: string): string {
  return name
    .replace(/\.spec$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s-_]+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
