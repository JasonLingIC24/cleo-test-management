export function extractActor(text: string): string {

  const match = text.match(/as an? (.+?) (with|i want|so that)/i);

  if (match && match[1]) {
    return match[1].trim();
  }

  return "user";
}

export function cleanUserStory(text: string): string {
  return text
    .replace(/as an? .*? so that .*?\./i, "")
    .trim();
}