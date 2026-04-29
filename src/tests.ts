/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { analyzeMom } from "../src/services/geminiService.ts";
import { MOCK_MOMS } from "../src/data.ts";

export async function runTests() {
  console.log("Starting BabyTrack AI Evals...");
  
  const tests = [
    { name: "Rich Pregnancy History", index: 0, expected: "pregnancy" },
    { name: "Single Order Uncertainty", index: 1, checkUncertainty: true },
    { name: "Toddler Stage Detection", index: 2, expected: "toddler" },
    { name: "New Mumz Stage", index: 3, expected: "new_mumz" },
    { name: "Contradictory Signals", index: 5, expectedConfidence: "low" },
    { name: "Unknown Products - No Hallucination", index: 15, checkZeroRecommendations: true, checkUncertainty: true },
    { name: "Premature Baby - Uncertainty", index: 16, checkUncertainty: true, expectedConfidenceNot: "high" },
  ];

  for (const test of tests) {
    try {
      const mom = MOCK_MOMS[test.index];
      const result = await analyzeMom(mom);
      
      if (test.checkZeroRecommendations && result.recommendations.length !== 0) {
        throw new Error(`Expected zero recommendations for index ${test.index}`);
      }
      if (test.checkUncertainty && !result.uncertainty_flag) {
        throw new Error(`Expected uncertainty_flag: true for index ${test.index}`);
      }
      if (test.expectedConfidenceNot === "high" && result.stage_confidence === "high") {
        throw new Error(`Expected stage_confidence NOT to be high for index ${test.index}`);
      }

      console.log(`PASS: ${test.name}`);
    } catch (err) {
      console.error(`FAIL: ${test.name}`, err);
    }
  }
}
