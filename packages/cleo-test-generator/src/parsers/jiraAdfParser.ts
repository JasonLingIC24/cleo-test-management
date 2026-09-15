export function extractPlainTextFromADF(adf: any): string {
  if (!adf || !adf.content) return "";

  const walk = (node: any): string => {
    if (!node) return "";

    if (node.type === "text") return node.text || "";

    if (!node.content) return "";

    return node.content.map(walk).join(" ");
  };

  return walk(adf).replace(/\s+/g, " ").trim();
}