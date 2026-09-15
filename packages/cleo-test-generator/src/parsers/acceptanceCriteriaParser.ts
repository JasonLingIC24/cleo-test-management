export function extractAcceptanceCriteria(text: string): string[] {
  if (!text) return [];

  const lower = text.toLowerCase();

  // ✅ Find AC section
  const start = lower.indexOf("acceptance criteria");

  if (start === -1) return [];

  // ✅ Cut from AC onwards
  let acText = text.substring(start);

  // ✅ Remove junk after AC
  const stopWords = ["things to find out"];
  for (const stop of stopWords) {
    const idx = acText.toLowerCase().indexOf(stop);
    if (idx !== -1) {
      acText = acText.substring(0, idx);
    }
  }

  // ✅ Split into sentences
  const steps = acText
    .replace(/\n/g, " ")
    .split(/\.|\n| - |•/)
    .map(s => s.trim())
    .filter(s =>
      s.length > 15 &&
      !s.toLowerCase().startsWith("acceptance criteria")
    );


  // ✅ CLEAN (now correctly applied)
  const atomicSteps = steps.flatMap(step => splitIntoAtomicSteps(step));

  return cleanSteps(atomicSteps);
}

function cleanSteps(steps: string[]): string[] {
  return steps.filter(s => {
    const lower = s.toLowerCase();

    return !(
      lower.startsWith("as a") ||
      lower.startsWith("i want") ||
      lower.startsWith("so that")
    );
  });
}

export function isBDDFormatted(text: string): boolean {
  const lower = text.toLowerCase();

  return (
    lower.includes("given ") &&
    lower.includes("when ") &&
    lower.includes("then ")
  );
}

export function extractBDDSteps(text: string): string[] {
  return text
    .split(/given|when|then/gi)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function splitIntoAtomicSteps(step: string): string[] {
  return step
    // ✅ normalize first
    .replace(/\n/g, " ")

    // ✅ force split BEFORE keywords
    .replace(/\b(AND|THEN|WHEN|GIVEN)\b/gi, "|||$1")

    .split("|||")
    .map(s => s.trim())

    // ✅ remove empty
    .filter(s => s.length > 10)

    // ✅ remove keywords AFTER splitting
    .map(s =>
      s.replace(/^(and|then|when|given)\s+/i, "").trim()
    );
}

function removeUserStory(text: string): string {
  return text.replace(/as an? .*? so that .*?\./i, "").trim();
}
