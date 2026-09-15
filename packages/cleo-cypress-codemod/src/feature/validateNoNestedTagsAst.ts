import { Node, SourceFile, CallExpression } from "ts-morph";

export function validateNoNestedTagsAst(
    sourceFile: SourceFile
): { valid: boolean; violations: string[]; warnings: string[] } {

    const violations: string[] = [];
    const warnings: string[] = []; // ✅ ADD THIS


    sourceFile.forEachDescendant((node) => {

        if (!Node.isCallExpression(node)) return;

        const callee = node.getExpression();

        if (!Node.isIdentifier(callee)) return;

        const name = callee.getText();

        if (!["describe", "context", "it", "test"].includes(name)) return;

        const title = getTitle(node);

        const isTopLevel = isTopLevelTestContainer(node);

        const isFeature =
            isTopLevel || title?.startsWith("Feature:");


        const optionsArg = node.getArguments()[1];

        if (
            !isFeature &&
            optionsArg &&
            Node.isObjectLiteralExpression(optionsArg)
        ) {

            const tagsProp = optionsArg.getProperty("tags");

            if (tagsProp) {

                const tags = extractTagsFromProperty(tagsProp);

                const structuralTags = tags.filter(isStructuralTag);
                const allowedTags = tags.filter(isAllowedNestedTag);

                // ✅ CASE 1 — invalid nested structural tags
                if (structuralTags.length > 0) {
                    violations.push(
                        `Invalid nested structural tags in "${title || "Unnamed block"}": ${structuralTags.join(", ")}`
                    );
                }

                // ✅ CASE 2 — allowed but reported
                if (allowedTags.length > 0) {
                    warnings.push(
                        `Allowed nested tags in "${title || "Unnamed block"}": ${allowedTags.join(", ")}`
                    );
                }
            }
        }
    });

    return {
        valid: violations.length === 0,
        violations,
        warnings
    };

}

/* ───────── helpers ───────── */

const STRUCTURAL_TAG_PREFIXES = [
    "@domain:",
    "@subdomain:"
];

const STRUCTURAL_TAGS = [
    "@default",
    "@nightly",
    "@sequential"
];

const ALLOWED_NESTED_TAGS = [
    "@archive",
    "@non-blocking"
];

function getTitle(call: CallExpression): string | undefined {
    const arg = call.getArguments()[0];

    if (
        Node.isStringLiteral(arg) ||
        Node.isNoSubstitutionTemplateLiteral(arg)
    ) {
        return arg.getLiteralText();
    }

    return undefined;
}

function isTopLevelTestContainer(node: Node): boolean {
    let current = node.getParent();

    while (current) {
        if (Node.isCallExpression(current)) {
            const callee = current.getExpression();

            if (
                Node.isIdentifier(callee) &&
                callee.getText() === "describe"
            ) {
                return false; // ❌ nested inside another describe
            }
        }

        current = current.getParent();
    }

    return true; // ✅ no parent describe
}

function isStructuralTag(tag: string): boolean {
    return STRUCTURAL_TAGS.includes(tag) ||
        STRUCTURAL_TAG_PREFIXES.some(prefix => tag.startsWith(prefix));
}

function isAllowedNestedTag(tag: string): boolean {
    return ALLOWED_NESTED_TAGS.includes(tag);
}

function extractTagsFromProperty(tagsProp: any): string[] {
    const initializer = tagsProp.getInitializer();

    if (!initializer || !Node.isArrayLiteralExpression(initializer)) return [];

    return initializer.getElements()
        .filter(Node.isStringLiteral)
        .map(el => el.getLiteralText());
}