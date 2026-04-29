import { CATALOG } from "../catalog.ts";

export interface CatalogItem {
  name: string;
  category: string;
  stage: string;
}

const flattenedCatalog: CatalogItem[] = Object.entries(CATALOG).flatMap(([stage, items]) =>
  items.map(item => ({ ...item, stage }))
);

export type EmbeddedProduct = CatalogItem & { embedding: number[] };
let embeddedCatalog: EmbeddedProduct[] = [];

/**
 * Build the RAG index once at startup
 */
export async function buildIndex() {
  console.log(">>> Building semantic RAG index...");
  embeddedCatalog = await Promise.all(
    flattenedCatalog.map(async (p) => ({
      ...p,
      embedding: await getEmbedding(p.name + " " + p.category + " " + p.stage),
    }))
  );
  console.log(">>> RAG index ready with", embeddedCatalog.length, "items.");
}

/**
 * Get embedding for a piece of text using Gemini API
 */
async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Fallback: Return zero vector if no API key
    return new Array(768).fill(0);
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: "models/text-embedding-004", 
          content: { parts: [{ text }] } 
        }),
      }
    );
    const data = await res.json();
    if (data.error) {
      console.error("Embedding API error:", data.error.message);
      return new Array(768).fill(0);
    }
    return data.embedding.values;
  } catch (error) {
    console.error("Failed to fetch embedding:", error);
    return new Array(768).fill(0);
  }
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB + 1e-9);
}

/**
 * RAG: Retrieve products semantically
 */
export async function retrieveProductsSemantically(query: string, topK = 3) {
  const queryEmbedding = await getEmbedding(query);
  
  // If index hasn't been built yet (e.g. startup failed), build it lazily
  if (embeddedCatalog.length === 0) {
    await buildIndex();
  }

  return embeddedCatalog
    .map(p => ({ 
      ...p, 
      score: cosineSimilarity(queryEmbedding, p.embedding) 
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

