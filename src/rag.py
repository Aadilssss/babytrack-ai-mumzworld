import numpy as np
import google.generativeai as genai
from src.catalog import CATALOG

# Flatten catalog into list of product dicts
def get_all_products():
    products = []
    for stage, items in CATALOG.items():
        for item in items:
            products.append({**item, "stage": stage})
    return products

def embed_text(text: str) -> list[float]:
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text
    )
    return result["embedding"]

def build_catalog_index():
    """Pre-embed all catalog products once at startup."""
    products = get_all_products()
    catalog_with_embeddings = []
    
    # In a real app, you'd cache these. For this demo, we embed at startup.
    for p in products:
        text = f"{p['name']} {p['category']} {p['stage']}"
        embedding = embed_text(text)
        catalog_with_embeddings.append({
            "data": p,
            "embedding": np.array(embedding)
        })
    return catalog_with_embeddings

def retrieve_products(query: str, index, top_k=3):
    """Retrieve top-k products by cosine similarity."""
    q_emb = np.array(embed_text(query))
    
    scored_items = []
    for item in index:
        emb = item["embedding"]
        # Cosine similarity
        norm = (np.linalg.norm(emb) * np.linalg.norm(q_emb)) + 1e-9
        score = (emb @ q_emb) / norm
        scored_items.append({**item["data"], "similarity_score": float(score)})
    
    scored_items.sort(key=lambda x: x["similarity_score"], reverse=True)
    return scored_items[:top_k]
