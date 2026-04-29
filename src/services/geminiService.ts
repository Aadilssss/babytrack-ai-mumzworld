/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGenAI } from "./aiConfig.ts";
import { BabyTrackOutput, MomProfile, BabyTrackOutputSchema, MomOrder } from "../types.ts";
import { CATALOG } from "../catalog.ts";
import { retrieveProductsSemantically } from "./ragService.ts";

/**
 * Weighted scoring for baby stage detection based on recency and frequency
 */
function detectStage(orders: MomOrder[]): { 
  stage: keyof typeof CATALOG | "unknown"; 
  confidence: "high" | "medium" | "low";
  contradiction: boolean;
} {
  const now = new Date('2026-04-29'); // Use fixed date for demo consistency

  const stageRules: Record<string, string[]> = {
    pregnancy:        ["maternity", "prenatal", "bump", "hospital bag"],
    new_mumz_0_2mo:   ["newborn", "size 1", "bassinet", "swaddle"],
    early_baby_2_4mo: ["size 2", "bouncer", "play mat", "tummy time"],
    baby_4_6mo:       ["size 3", "high chair", "solid", "food", "sippy"],
    toddler_12mo_plus:["walking", "toddler", "potty", "learning blocks"],
  };

  const scores: Record<string, number> = {};

  for (const order of orders) {
    const daysAgo = (now.getTime() - new Date(order.date).getTime()) / 86400000;
    const recencyWeight = daysAgo < 30 ? 3 : daysAgo < 90 ? 2 : 1; 
    const product = order.product.toLowerCase();

    for (const [stage, keywords] of Object.entries(stageRules)) {
      if (keywords.some(k => product.includes(k))) {
        scores[stage] = (scores[stage] || 0) + recencyWeight * order.quantity;
      }
    }
  }

  const scoreEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (scoreEntries.length === 0) return { stage: "unknown", confidence: "low", contradiction: false };

  const top = scoreEntries[0];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const dominance = top[1] / total;
  
  // Fix 1: Contradiction Detection
  let contradiction = false;
  if (scoreEntries.length > 1) {
    const runnerUp = scoreEntries[1];
    // If the gap between top and runner-up is small, it's a contradiction
    if ((top[1] - runnerUp[1]) / top[1] < 0.2) {
      contradiction = true;
    }
  }

  let confidence: "high" | "medium" | "low" = dominance > 0.7 ? "high" : dominance > 0.4 ? "medium" : "low";

  // Fix 2: Minimum Data Threshold
  if (orders.length < 2 && confidence === "high") {
    confidence = "medium";
  }

  return { stage: top[0] as keyof typeof CATALOG, confidence, contradiction };
}

export async function analyzeMom(mom: MomProfile): Promise<BabyTrackOutput> {
  // 1. Signal Detection (Weighted Scoring)
  const { stage: detectedStage, confidence, contradiction } = detectStage(mom.orders);
  
  let uncertainty_flag = contradiction;
  let uncertainty_reason: string | null = contradiction ? "Contradictory signals found in order history." : null;
  
  // Stated due date takes absolute priority
  let finalStage = detectedStage;
  let finalConfidence = confidence;

  if (mom.due_date) {
    finalStage = "pregnancy";
    finalConfidence = "high";
  }

  if (finalConfidence === "low" && !mom.due_date) {
    return buildUnknownResponse(mom);
  }

  // Handle Edge Case: Non-baby products
  const productsTxt = mom.orders.map(o => o.product.toLowerCase()).join(" ");
  const babyKeywords = ["baby", "maternity", "newborn", "size", "diaper", "toy", "feeding", "pump", "prenatal", "nicu"];
  const hasBabySignals = babyKeywords.some(k => productsTxt.includes(k));
  
  if (mom.orders.length > 0 && !hasBabySignals && !mom.due_date) {
    return buildUnknownResponse(mom);
  }

  // Handle Edge Case: Premature signals
  if (productsTxt.includes("nicu") || productsTxt.includes("preemie")) {
    uncertainty_flag = true;
    uncertainty_reason = "Signals detect a potential premature birth (NICU/Preemie items).";
  }

  // 2. RAG Retrieval (Semantic)
  const query = finalStage === "unknown" ? "popular baby products" : `essential recommendations for ${finalStage} baby`;
  const contextProducts = await retrieveProductsSemantically(query, 3);

  // 3. AI Personalization (Refined Prompt)
  const ai = getGenAI();
  if (!ai) return getMockAnalysis(mom);

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are BabyTrack AI for Mumzworld, a baby care assistant.

CUSTOMER PROFILE:
- Name: ${mom.name}
- Detected Stage: ${finalStage}
- Recent Orders: ${JSON.stringify(mom.orders.slice(-5))}

CATALOG CONTEXT (prioritize these, but you may suggest well-known alternatives):
${JSON.stringify(contextProducts)}

YOUR TASK:
1. Pick 3 products most relevant to this baby stage. Prefer catalog items.
2. Detect which consumables (diapers, wipes, formula) are likely running low based on order dates and typical usage rates.
3. Write a warm, personal message in English AND Arabic.

RESPOND in this exact JSON shape:
{
  "recommendations": [{ "product": "string", "reason": "string", "category": "string" }],
  "running_low": [{ "product": "string", "days_remaining": number, "urgency": "high"|"medium"|"low" }],
  "message_en": "string",
  "message_ar": "string",
  "confidence_reason": "string"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(cleanJson);

    return {
      baby_stage: finalStage as any,
      stage_confidence: finalConfidence,
      confidence_reason: aiData.confidence_reason || `Stage detected via weighted history scoring.`,
      running_low: aiData.running_low || [],
      recommendations: aiData.recommendations || [],
      message_en: aiData.message_en,
      message_ar: aiData.message_ar,
      uncertainty_flag,
      uncertainty_reason
    };
  } catch (err) {
    console.error("LLM Step failed, falling back", err);
    return getMockAnalysis(mom);
  }
}

function buildUnknownResponse(mom: MomProfile): BabyTrackOutput {
  return {
    baby_stage: "unknown",
    stage_confidence: "low",
    confidence_reason: "Customer history contains non-baby items. No recommendations provided to avoid hallucination.",
    running_low: [],
    recommendations: [],
    message_en: `Hello ${mom.name}! We've noticed you're browsing Mumzworld, but we haven't found enough signals to personalize your journey yet.`,
    message_ar: `أهلاً ${mom.name}! لقد لاحظنا أنكِ تتصفحين ممزورلد، لكننا لم نجد إشارات كافية لتخصيص رحلتكِ بعد.`,
    uncertainty_flag: true,
    uncertainty_reason: "Non-baby purchase history detected."
  };
}

function getMockAnalysis(mom: MomProfile): BabyTrackOutput {
  const { stage, confidence } = detectStage(mom.orders);
  
  const stageDisplay = stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const stageProducts = CATALOG[stage as keyof typeof CATALOG] || [];
  const recs = stageProducts.slice(0, 3).map(p => ({
    product: p.name,
    category: p.category,
    reason: `Based on your baby's transition into the ${stageDisplay} stage.`
  }));

  return {
    baby_stage: stage as any,
    stage_confidence: confidence,
    confidence_reason: "Falling back to heuristic analysis due to AI unavailability.",
    running_low: [{ product: "Baby Wipes", days_remaining: 5, urgency: "medium" }],
    recommendations: recs,
    message_en: `Hello ${mom.name}! Based on your recent Mumzworld journey, it looks like you are in the ${stageDisplay} phase.`,
    message_ar: `أهلاً ${mom.name}! يبدو أنكِ في مرحلة ${stageDisplay}.`,
    uncertainty_flag: false,
    uncertainty_reason: null
  };
}

