import os
import google.generativeai as genai
from dotenv import load_dotenv
from src.schema import BabyTrackOutput
from src.rag import build_catalog_index, retrieve_products

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Global index built at load time (simulate startup)
CATALOG_INDEX = build_catalog_index()

def analyze_mom(mom: dict) -> BabyTrackOutput:
    # 1. Signal Detection (Deterministic)
    products_txt = " ".join([o['product'] for o in mom['orders']]).lower()
    signals = []
    if any(k in products_txt for k in ["maternity", "prenatal", "bump"]): signals.append("pregnancy")
    if any(k in products_txt for k in ["newborn", "size 1"]): signals.append("new_mumz_0_2mo")
    
    detected_stage = "early_baby_2_4mo"
    if signals:
        detected_stage = signals[-1]
    
    # 2. RAG Retrieval 
    query = f"Recommended products for {detected_stage} or {mom['name']}'s needs"
    context_products = retrieve_products(query, CATALOG_INDEX, top_k=3)

    # 3. Smart AI Prompt (Strict Context)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are BabyTrack AI, an intelligent baby care assistant for Mumzworld.
    
    STRICT RULES:
    1. Answer ONLY using the provided context below.
    2. Do NOT guess or add extra information.
    3. If not found, say: "I don't have enough information".
    
    CONTEXT (Catalog Items):
    {context_products}
    
    USER PROFILE:
    Name: {mom['name']}
    Detected Stage: {detected_stage}
    Orders: {mom['orders']}

    TASK:
    - Provide 2-3 recommendations from the CONTEXT above.
    - Write a short message in English and Arabic.
    - Explain WHY these products match their stage.
    
    Return ONLY JSON matching the schema.
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return BabyTrackOutput.parse_safe(response.text)
        
    except Exception as e:
        return BabyTrackOutput(
            baby_stage=detected_stage,
            stage_confidence=confidence,
            confidence_reason=f"Pipeline Error: {str(e)}",
            running_low=[],
            recommendations=[],
            message_en="Error analyzing journey.",
            message_ar="خطأ في تحليل الرحلة.",
            uncertainty_flag=uncertainty_flag,
            uncertainty_reason=uncertainty_reason
        )
