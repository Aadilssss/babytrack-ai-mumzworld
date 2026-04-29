/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MomProfile } from './types.ts';

// Today's date relative to prompt: April 28, 2026
const D = (daysAgo: number) => {
  const date = new Date('2026-04-28');
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const MOCK_MOMS: MomProfile[] = [
  {
    id: 0,
    name: "Sara",
    language: "en",
    orders: [
      { date: D(180), product: "Maternity Pillow", quantity: 1 },
      { date: D(150), product: "Prenatal Vitamins", quantity: 2 },
      { date: D(120), product: "Bump Band", quantity: 1 },
      { date: D(90), product: "Hospital Bag Bundle", quantity: 1 },
      { date: D(60), product: "Nursery Storage Gear", quantity: 2 },
      { date: D(30), product: "Baby Monitor", quantity: 1 }
    ]
  },
  {
    id: 1,
    name: "Fatima",
    language: "ar",
    due_date: "2026-10-15",
    orders: [
      { date: D(10), product: "Maternity Pillow", quantity: 1 }
    ]
  },
  {
    id: 2,
    name: "Noura",
    language: "ar",
    orders: [
      { date: D(400), product: "Maternity Pillow", quantity: 1 },
      { date: D(350), product: "Electric Breast Pump", quantity: 1 },
      { date: D(300), product: "Anti-Colic Feeding Bottles", quantity: 3 },
      { date: D(200), product: "Compact Baby Bouncer", quantity: 1 },
      { date: D(100), product: "Convertible High Chair", quantity: 1 },
      { date: D(10), product: "Supportive Walking Shoes", quantity: 1 }
    ]
  },
  {
    id: 3,
    name: "Aisha",
    language: "ar",
    orders: [
      { date: D(20), product: "Newborn Diapers Size 1", quantity: 4 },
      { date: D(15), product: "Newborn Essentials Clothes Set", quantity: 1 },
      { date: D(5), product: "Co-Sleeper Bassinet", quantity: 1 }
    ]
  },
  {
    id: 4,
    name: "Layla",
    language: "en",
    orders: [
      { date: D(120), product: "Diapers Size 2 Bulk Pack", quantity: 2 },
      { date: D(60), product: "Tummy Time Play Mat", quantity: 1 },
      { date: D(5), product: "Diapers Size 3 Mega Pack", quantity: 1 }
    ]
  },
  {
    id: 5,
    name: "Maryam",
    language: "ar",
    orders: [
      { date: D(5), product: "Newborn Diapers Size 1", quantity: 1 },
      { date: D(5), product: "Toddler Transition Bed", quantity: 1 }
    ]
  },
  {
    id: 6,
    name: "Sarah",
    language: "en",
    orders: [
      { date: D(30), product: "Interactive Learning Blocks", quantity: 2 },
      { date: D(15), product: "3-in-1 Potty Trainer", quantity: 1 }
    ]
  },
  {
    id: 7,
    name: "Hessa",
    language: "ar",
    orders: [
      { date: D(45), product: "Cotton Swaddle Blankets", quantity: 3 },
      { date: D(10), product: "Diapers Size 2 Bulk Pack", quantity: 2 }
    ]
  },
  {
    id: 8,
    name: "Dana",
    language: "en",
    orders: [
      { date: D(2), product: "Early Baby Sensory Kit", quantity: 1 }
    ]
  },
  {
    id: 9,
    name: "Reem",
    language: "ar",
    orders: [
      { date: D(20), product: "Hospital Bag Bundle", quantity: 1 },
      { date: D(1), product: "Newborn Diapers Size 1", quantity: 2 }
    ]
  },
  {
    id: 10,
    name: "Nour",
    language: "ar",
    orders: [
      { date: D(150), product: "Diapers Size 3 Mega Pack", quantity: 4 },
      { date: D(5), product: "Trainer Sippy Cup", quantity: 2 }
    ]
  },
  {
    id: 11,
    name: "Lina",
    language: "en",
    orders: [
      { date: D(10), product: "Supportive Walking Shoes", quantity: 1 },
      { date: D(5), product: "3-in-1 Potty Trainer", quantity: 1 }
    ]
  },
  {
    id: 12,
    name: "May",
    language: "en",
    orders: [
      { date: D(30), product: "Newborn Diapers Size 1", quantity: 3 },
      { date: D(14), product: "Newborn Diapers Size 1", quantity: 3 },
      { date: D(2), product: "Newborn Diapers Size 1", quantity: 3 }
    ]
  },
  {
    id: 13,
    name: "Joud",
    language: "ar",
    orders: [
      { date: D(40), product: "Yoga Mat", quantity: 1 },
      { date: D(5), product: "Hand Blender", quantity: 1 }
    ]
  },
  {
    id: 14,
    name: "Rana",
    language: "en",
    orders: [
      { date: D(30), product: "Maternity Pillow", quantity: 1 },
      { date: D(2), product: "Newborn Diapers Size 1", quantity: 2 }
    ]
  },
  {
    id: 15,
    name: "EdgeCase - Unknown Products",
    language: "en",
    orders: [
      { date: D(10), product: "Gaming Chair", quantity: 1 },
      { date: D(5), product: "Coffee Machine", quantity: 1 }
    ]
  },
  {
    id: 16,
    name: "Reem - Premature Baby",
    language: "ar",
    orders: [
      { date: D(200), product: "Maternity Pillow", quantity: 1 },
      { date: D(160), product: "NICU Essentials Kit", quantity: 1 },
      { date: D(155), product: "Preemie Diapers Size P", quantity: 3 },
      { date: D(150), product: "Hospital Grade Breast Pump", quantity: 1 }
    ]
  }
];
