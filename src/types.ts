/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const RunningLowItemSchema = z.object({
  product: z.string(),
  days_remaining: z.number(),
  urgency: z.enum(['high', 'medium', 'low']),
});

export const RecommendationSchema = z.object({
  product: z.string(),
  reason: z.string(),
  category: z.string(),
});

export const BabyTrackOutputSchema = z.object({
  baby_stage: z.string(),
  stage_confidence: z.enum(['high', 'medium', 'low']),
  confidence_reason: z.string(),
  running_low: z.array(RunningLowItemSchema),
  recommendations: z.array(RecommendationSchema),
  message_en: z.string(),
  message_ar: z.string(),
  uncertainty_flag: z.boolean(),
  uncertainty_reason: z.string().optional(),
});

export type BabyTrackOutput = z.infer<typeof BabyTrackOutputSchema>;
export type RunningLowItem = z.infer<typeof RunningLowItemSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;

export interface MomOrder {
  date: string;
  product: string;
  quantity: number;
}

export interface MomProfile {
  id: number;
  name: string;
  language: 'en' | 'ar';
  orders: MomOrder[];
  due_date?: string; // e.g. "2026-06-15"
}
