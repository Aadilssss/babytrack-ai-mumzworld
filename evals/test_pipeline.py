import pytest
from src.pipeline import analyze_mom
from src.data import MOCK_MOMS

def test_rich_pregnancy_history():
    res = analyze_mom(MOCK_MOMS[0])
    assert "pregnancy" in res.baby_stage.lower()
    assert res.stage_confidence == "high"

def test_single_order_uncertainty():
    res = analyze_mom(MOCK_MOMS[1])
    # Signals are weak
    assert res.uncertainty_flag is True

def test_toddler_stage_detection():
    res = analyze_mom(MOCK_MOMS[2])
    assert "toddler" in res.baby_stage.lower()

def test_arabic_mom_output():
    res = analyze_mom(MOCK_MOMS[3])
    assert res.message_ar != ""
    assert res.message_ar != res.message_en

def test_new_mumz_stage():
    res = analyze_mom(MOCK_MOMS[3])
    assert "new_mumz" in res.baby_stage.lower() or "0-2" in res.baby_stage

def test_contradictory_signals():
    res = analyze_mom(MOCK_MOMS[5])
    assert res.stage_confidence == "low"

def test_running_low_exists():
    # May has frequent diaper orders
    res = analyze_mom(MOCK_MOMS[12])
    assert len(res.running_low) > 0

def test_recommendations_exist():
    res = analyze_mom(MOCK_MOMS[4])
    assert len(res.recommendations) >= 1

def test_output_schema_valid():
    res = analyze_mom(MOCK_MOMS[0])
    assert res.baby_stage != ""

def test_no_hallucination_empty_history():
    res = analyze_mom(MOCK_MOMS[13])
    assert res.uncertainty_flag is True

def test_4_6_month_stage():
    res = analyze_mom(MOCK_MOMS[4])
    # Layla has 4-6 month signals (solid food or diapers size 3)
    # The LLM should recommend high chair or food
    assert any(x in str(res.recommendations).lower() for x in ["food", "chair", "cup"])

def test_english_language_preference():
    res = analyze_mom(MOCK_MOMS[0])
    assert res.message_en != ""
