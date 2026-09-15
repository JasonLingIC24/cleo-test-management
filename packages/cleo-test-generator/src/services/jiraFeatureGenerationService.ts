import fs from "fs";
import path from "path";

type StoryType = "user-story" | "technical" | "test" | "release";

function determineStoryType(
  story: any,
  userStory: {
    asA: string;
    iWant: string;
    soThat: string;
  },
): StoryType {
  const userStoryFields = [
    userStory.asA,
    userStory.iWant,
    userStory.soThat,
  ].filter(Boolean).length;

  if (userStoryFields >= 2) {
    return "user-story";
  }

  const summary = story.summary.toLowerCase();

  if (
    summary.includes("test") ||
    summary.includes("testing") ||
    summary.includes("qa")
  ) {
    return "test";
  }

  if (
    summary.includes("release") ||
    summary.includes("deploy") ||
    summary.includes("deployment")
  ) {
    return "release";
  }

  return "technical";
}

export async function generateFeatures(options: {
  inputFile: string;
  outputDir: string;
}) {
  console.log("📄 generateFeatures()");

  const inputFile = path.resolve(options.inputFile);

  console.log("Input file:", inputFile);
  const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  console.log(`Loaded ${data.length} epics`);
  const outputDir = path.resolve(options.outputDir);
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`First epic stories: ${data[0]?.stories?.length ?? 0}`);
  console.log("Output:", outputDir);
  let generated = 0;

  let userStoryCount = 0;
  let technicalCount = 0;
  let testCount = 0;
  let releaseCount = 0;

  for (const epic of data) {
    const epicFolder = path.join(
      outputDir,
      `${epic.key}-${sanitiseFileName(epic.summary)}`,
    );

    fs.mkdirSync(epicFolder, { recursive: true });

    for (const story of epic.stories) {
      const userStory = parseUserStory(story.description);

      const storyType = determineStoryType(story, userStory);

      story.storyType = storyType;

      switch (storyType) {
        case "user-story":
          userStoryCount++;
          break;

        case "technical":
          technicalCount++;
          break;

        case "test":
          testCount++;
          break;

        case "release":
          releaseCount++;
          break;
      }
      const content = generateFeatureContent(story);

      const filename = `${story.key}-${sanitiseFileName(
        story.summary,
      )}.feature`;

      fs.writeFileSync(path.join(epicFolder, filename), content);

      generated++;

      if (generated % 50 === 0) {
        console.log(`📄 Generated ${generated} feature files...`);
      }
    }
  }

  console.log(`
📊 Feature Generation Summary

   Epics             : ${data.length}
   Features          : ${generated}

   Story Types
   -----------
   User Stories      : ${userStoryCount}
   Technical Stories : ${technicalCount}
   Test Stories      : ${testCount}
   Release Stories   : ${releaseCount}

   Output            : ${outputDir}
`);
}

function extractSection(
  description: string,
  start: string,
  end?: string,
): string {
  const regex = end
    ? new RegExp(`${start}(.*?)${end}`, "is")
    : new RegExp(`${start}(.*)$`, "is");

  const match = description.match(regex);

  return match?.[1]?.trim() ?? "";
}

function parseUserStory(description: string) {
  const asA = description.match(/AS\s+A(?:N)?\s+(.*?)\n\nI WANT/is);

  const iWant = description.match(/I WANT\s+(.*?)\n\nSO THAT/is);

  const soThat = description.match(/SO THAT\s+(.*?)\n\nAcceptance Criteria/is);

  return {
    asA: asA?.[1]?.trim() ?? "",
    iWant: iWant?.[1]?.trim() ?? "",
    soThat: soThat?.[1]?.trim() ?? "",
  };
}

function parseAcceptanceCriteria(description: string): string[] {
  const match = description.match(/Acceptance Criteria:(.*)$/is);

  if (!match) {
    return [];
  }

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^-\s*/, ""))
    .filter(Boolean)
    .filter((line) => line !== ":")
    .filter((line) => line.toLowerCase() !== "acceptance criteria:");
}

function generateFeatureContent(story: any): string {
  const userStory = parseUserStory(story.description);

  const storyType = determineStoryType(story, userStory);
  const isUserStory = userStory.asA && userStory.iWant && userStory.soThat;
  const acceptanceCriteria = parseAcceptanceCriteria(story.description);

  const scenarios = acceptanceCriteria
    .filter(isScenarioCandidate)
    .map(generateScenario);

  if (acceptanceCriteria.length > 10) {
    console.log(`
🔍 Large AC Set

${story.key}
${story.summary}

${acceptanceCriteria.length} items
`);
  }

  return `# Story Type: ${storyType}

Feature: ${story.summary}

  As ${userStory.asA}
  I want ${userStory.iWant}
  So that ${userStory.soThat}

  Background:
    Given the system is available

${scenarios.join("\n")}
`;
}

function sanitiseFileName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateScenario(criterion: string): string {
  const text = criterion.trim();

  const whenMatch = text.match(/^When\s+(.*?),\s*(.*)$/i);

  if (whenMatch) {
    const condition = whenMatch[1].trim();

    const outcome = whenMatch[2].trim();

    return `
  Scenario: ${outcome}

    When ${condition}
    Then ${outcome}
`;
  }

  return `
  Scenario: ${text}

    When the functionality is used
    Then ${text}
`;
}

function isScenarioCandidate(criterion: string): boolean {
  const text = criterion.trim();

  if (!text) {
    return false;
  }

  if (text === ":") {
    return false;
  }

  if (text.endsWith(":")) {
    return false;
  }

  if (text.startsWith("AND ")) {
    return false;
  }

  // Common headings
  const headings = [
    "Performance",
    "Security",
    "Availability",
    "Maintainability",
    "Usability",
    "Auditability",
    "Scalability",
    "Support",
    "Notes",
    "Background",
    "Non-Functional Requirements",
  ];

  if (
    headings.some((heading) =>
      text.toLowerCase().startsWith(heading.toLowerCase()),
    )
  ) {
    return false;
  }

  // Single-field rows
  if (text.length < 40 && !text.includes(" ")) {
    return false;
  }

  return true;
}
