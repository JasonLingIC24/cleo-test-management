export function extractJiraText(adf: any): string {
  if (!adf) {
    return "";
  }

  const output: string[] = [];

  function walk(node: any) {
    if (!node) {
      return;
    }

    if (typeof node.text === "string") {
      output.push(node.text);
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }

    if (["paragraph", "listItem", "bulletList"].includes(node.type)) {
      output.push("\n");
    }
  }

  walk(adf);

  return output
    .join(" ")
    .replace(/\n\s+\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}
