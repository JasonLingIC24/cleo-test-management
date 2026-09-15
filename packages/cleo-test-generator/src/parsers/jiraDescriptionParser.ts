function extractText(node: any): string {
  if (!node) {
    return "";
  }

  switch (node.type) {
    case "text":
      return node.text ?? "";

    case "paragraph":
      return (node.content ?? []).map(extractText).join("") + "\n\n";

    case "heading":
      return (node.content ?? []).map(extractText).join("") + "\n\n";

    case "bulletList":
      return (node.content ?? []).map(extractText).join("");

    case "orderedList":
      return (node.content ?? []).map(extractText).join("");

    case "listItem":
      return "- " + (node.content ?? []).map(extractText).join("");

    default:
      return (node.content ?? []).map(extractText).join("");
  }
}

export function parseJiraDescription(description: any): string {
  if (!description?.content) {
    return "";
  }

  return description.content
    .map(extractText)
    .join("")
    .replace(/I WANT/g, "\n\nI WANT")
    .replace(/SO THAT/g, "\n\nSO THAT")
    .replace(/Acceptance Criteria:?/gi, "\n\nAcceptance Criteria:")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
