import type {
  ParsedSpec,
  Feature,
} from "../adapters/bddToTestEntities.js";

import { mapParsedSpecToFeature } from "../adapters/bddToTestEntities.js";

/**
 * Ingests a parsed Cypress BDD spec.
 *
 * NOTE:
 *  - Parsing happens OUTSIDE this package
 *  - This keeps test‑management decoupled
 */
export function ingestParsedSpec(
  parsedSpec: ParsedSpec,
): Feature {
  return mapParsedSpecToFeature(parsedSpec);
}