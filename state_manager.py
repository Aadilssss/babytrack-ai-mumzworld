import json
import os
from datetime import datetime

STATE_FILE = "user_states.json"

def _load() -> dict:
    if not os.path.exists(STATE_FILE):
        return {}
    try:
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def _save(data: dict):
    with open(STATE_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_user_state(user_id: int) -> dict | None:
    return _load().get(str(user_id))

def update_user_state(user_id: int, stage: str, confidence: str):
    data = _load()
    data[str(user_id)] = {
        "stage": stage,
        "confidence": confidence,
        "updated_at": datetime.utcnow().isoformat()
    }
    _save(data)

def detect_transition(prev: dict | None, new_stage: str) -> str | None:
    if prev and prev.get("stage") != new_stage:
        return f"Stage transition detected: {prev['stage']} → {new_stage}"
    return None

