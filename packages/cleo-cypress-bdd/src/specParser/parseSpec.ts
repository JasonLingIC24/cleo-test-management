// src/specParser/parseSpec.ts

import { SourceFile, CallExpression } from "ts-morph";
import { getTopLevelDescribes } from "./ast/getTopLevelDescribes.js";
import type { ParsedSpec, FeatureNode } from "./types.js";
import { getDescribeTitle } from "./ast/getDescribeTitle.js";
import { getTagsFromDescribe } from "./ast/getTagsFromDescribe.js";
import { getLocation } from "./ast/getLocation.js";
import { parseScenarios } from "./parseScenarios.js";

export function parseSpec(
  sourceFile: SourceFile,
  filePath: string,
): ParsedSpec {
  const featureCall = findFeatureDescribe(sourceFile);

  // ✅ SAFE SKIP
  if (!featureCall) {
    console.warn(
      `⚠️ Skipping file (no Feature describe): ${filePath}`
    );

    return {
      feature: {
        name: "Invalid Feature",
        tags: [],
        scenarios: []
      },
      filePath
    };
  }

  const feature: FeatureNode = {
    name: stripFeaturePrefix(
      getDescribeTitle(featureCall),
    ),
    tags: getTagsFromDescribe(featureCall),
    location: getLocation(featureCall, filePath),
    scenarios: parseScenarios(featureCall, filePath),
  };

  return { feature, filePath };
}

function findFeatureDescribe(
  sourceFile: SourceFile,
): CallExpression | undefined {
  const describes = getTopLevelDescribes(sourceFile);

  const features = describes.filter(d =>
    getDescribeTitle(d).startsWith("Feature:")
  );

  if (features.length === 0) {
    return undefined;
  }

  if (features.length > 1) {
    throw new Error("Multiple Feature describes found");
  }

  return features[0];
}

function stripFeaturePrefix(title: string): string {
  return title.replace(/^Feature:\s*/i, "").trim();
}
