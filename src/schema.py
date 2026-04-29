from pydantic import BaseModel, Field
from typing import Literal, List, Optional
import json
import re

class RunningLowItem(BaseModel):
    product: str
    days_remaining: int
    urgency: Literal["high", "medium", "low"]

class Recommendation(BaseModel):
    product: str
    reason: str
    category: str

class BabyTrackOutput(BaseModel):
    baby_stage: str
    stage_confidence: Literal["high", "medium", "low"]
    confidence_reason: str
    running_low: List[RunningLowItem]
    recommendations: List[Recommendation]
    message_en: str
    message_ar: str
    uncertainty_flag: bool
    uncertainty_reason: Optional[str] = None

    @classmethod
    def parse_safe(cls, raw: str):
        # Strip markdown code fences
        clean = re.sub(r'```json\s*|\s*```', '', raw).strip()
        try:
            data = json.loads(clean)
            return cls(**data)
        except Exception as e:
            raise ValueError(f"Failed to parse BabyTrackOutput: {str(e)}")
