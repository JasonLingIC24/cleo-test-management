export function cleanText(input: string): string {
  return (input || "")

    // ✅ remove wrapping quotes/backticks
    .replace(/^["'`]+|["'`]+$/g, "")

    // ✅ join concatenated strings: "foo" + "bar"
    .replace(/["'`]\s*\+\s*["'`]/g, " ")

    // ✅ normalize multi-line template literals
    .replace(/\n\s*/g, " ")

    // ✅ fix template variables ${x} → {x}
    .replace(/\$\{\$?\{?([\w\.]+)\}?/g, (_, v: string) => {
      return `{${v.split(".").pop()}}`;
    })

    // ✅ remove TC IDs like [PAT-XXX]
    .replace(/\[[^\]]+\]\s*/, "")

    // ✅ clean broken quotes
    .replace(/^"+|"+$/g, "")

    // ✅ collapse whitespace
    .replace(/\s+/g, " ")

    .trim();
}
