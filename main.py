from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.pipeline import analyze_mom
from src.data import MOCK_MOMS
from src.catalog import CATALOG
from state_manager import get_user_state, update_user_state, detect_transition

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/api/moms")
def get_moms():
    return [{"id": i, "name": m["name"]} for i, m in enumerate(MOCK_MOMS)]

@app.get("/api/catalog")
def get_catalog():
    return CATALOG

@app.post("/api/analyze")
def analyze(payload: dict):
    idx = payload.get("mom_index")
    if idx is None or idx >= len(MOCK_MOMS):
        raise HTTPException(status_code=404, detail="Mom not found")
    
    mom = MOCK_MOMS[idx]
    
    try:
        # 1. Fetch previous state
        prev_state = get_user_state(mom["id"])
        
        # 2. Run core AI analysis
        result = analyze_mom(mom)
        
        # 3. Detect Stage Transition
        transition_note = detect_transition(prev_state, result.baby_stage)
        if transition_note:
            result.confidence_reason = f"{transition_note}. {result.confidence_reason}"

        # 4. Layer-based behavior (Progressive Intelligence)
        conf = result.stage_confidence
        if conf == "low":
            result.recommendations = result.recommendations[:1]
            result.message_en += " (We're still learning about your journey, more tips coming soon!)"
        elif conf == "medium":
            result.recommendations = result.recommendations[:2]

        # 5. Update state for next run
        update_user_state(mom["id"], result.baby_stage, conf)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    from fastapi.responses import FileResponse
    return FileResponse('static/index.html')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
