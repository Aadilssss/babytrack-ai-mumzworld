# 👶 BabyTrack AI — Mumzworld Journey Intelligence Engine

**Track A — AI Engineering Intern Assessment**

BabyTrack AI is a personalization layer for Mumzworld that reads a mom's order history, automatically detects her current life stage (Pregnancy → New Mumz → Toddler Mumz), predicts what she is running low on, and recommends what she needs next — in English and Arabic.

Mumzworld already shows three life-stage sections as static banners. A mom has to figure out which one she is in. This is the intelligence layer that does it for her.

---

## 🎥 Demo

[▶️ Watch 3-min Demo](https://www.loom.com/share/4644b76613c74f0cbef0ac042b0b97a8)

---

## 🚀 Setup & Run (under 5 minutes)

### Prerequisites
- Python 3.9+
- A free Gemini API key → [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/Aadilssss/babytrack-ai-mumzworld.git
cd babytrack-ai-mumzworld
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up your API key
```bash
cp .env.example .env
```
Open `.env` and add your key:
```
GEMINI_API_KEY="your_gemini_key_here"
```

### 4. Run the app
```bash
python main.py
```

### 5. Open in browser
```
http://localhost:8000
```

That's it. Select a mom profile and click Analyze.

---

## 🧠 Architecture

The system runs a 3-step hybrid pipeline:

**Step 1 — Signal Detection (deterministic)**
Orders are parsed and mapped to weighted stage signals. Recency is prioritized — a Size 3 diaper purchase last week beats a maternity pillow from 8 months ago.

**Step 2 — RAG Retrieval**
The detected stage is used to query the product catalog using Gemini text embeddings (`text-embedding-004`) and cosine similarity. Only products that exist in the catalog are surfaced — no hallucination possible.

**Step 3 — LLM Synthesis (Gemini 1.5 Flash)**
The mom's profile + retrieved products are passed to the model with a strict prompt. The model generates the bilingual message, running-low predictions, and confidence reasoning. The output is validated against a Pydantic schema — failures are explicit, never silent.

**Progressive Intelligence (3 layers)**
- Low confidence → 1 recommendation, uncertainty flagged
- Medium confidence → 2 recommendations
- High confidence → full recommendation set

**State Persistence**
Stage transitions are tracked in memory. If a mom moves from `pregnancy` to `new_mumz_0_2mo`, a transition note is appended to the confidence reason.

---

## ⚖️ Tradeoffs

### Why this problem
Mumzworld's life-stage sections are static pages with zero purchase intelligence. Every signal a mom generates — diapers, formula, maternity pillows — goes unread. The platform doesn't know her baby exists. This is a high-revenue, high-retention problem that no GCC e-commerce platform has solved with real stage intelligence.

I rejected these alternatives:
- **Customer service email triage** — useful but low product differentiation
- **Return reason classifier** — operational, not customer-facing
- **Product comparison generator** — content problem, not a personalization problem

This problem won because it touches the full customer lifecycle, drives repeat purchase, and the signal (order history) already exists on the platform.

### Model choice
I chose `gemini-1.5-flash` because it is fast, cheap, supports JSON mode natively, and handles Arabic well enough for this prototype. I would evaluate GPT-4o or Claude Sonnet for production given their stronger Arabic output.

### Architecture tradeoffs
- **In-memory vector store** instead of Pinecone or ChromaDB — sufficient for a prototype with a fixed catalog, wrong for production
- **Heuristic signal detection** instead of letting the LLM infer stage — more predictable, easier to debug, faster
- **FastAPI** instead of Flask — async support, automatic docs, Pydantic integration out of the box

### What I cut
- Real-time diaper depletion math (would need actual purchase timestamps + quantity data)
- Fine-tuning on Arabic parenting vocabulary
- A/B eval comparing rule-based vs LLM-only stage detection
- Contradiction detector (two conflicting stages in same week → force uncertainty flag)

### What I would build next
- Contradiction detection: if top two stages are within 20% of each other in score, force `uncertainty_flag=true`
- Minimum order threshold: if `orders < 2`, cap confidence at `medium` regardless of dominance score
- Real embeddings evaluation: measure retrieval precision@3 across all stage queries
- Push notifications: "Your diapers are running low" triggered at 7-day threshold

### Known failure modes
1. **Single-order bug**: one matching order scores 100% dominance → `high` confidence. Fix: add minimum order count check.
2. **Contradictory signals**: system picks top stage by score without checking if two stages are nearly tied. Fix: contradiction detector.
3. **Arabic quality**: output is correct but occasionally reads like formal MSA rather than GCC conversational Arabic. Fix: few-shot examples in prompt.

---

## 🧪 Evals

Full evaluation report with 12 test cases, RAG retrieval proof, and honest failure analysis is in [`EVALS.md`](./EVALS.md).

**Summary:**
- 12 test cases (6 happy path, 4 edge cases, 2 failure/refusal)
- 12/12 pass on stage detection and uncertainty flagging
- 2 known failure modes documented with root cause and fix

---

## 🧰 Tooling

**Models used:**
- `gemini-1.5-flash` — LLM synthesis, bilingual message generation, recommendation reasoning
- `text-embedding-004` — RAG retrieval, semantic product search

**AI assistants used:**
- **Claude (Anthropic)** — used for pair-coding throughout: pipeline architecture, Pydantic schema design, prompt iteration, and eval case generation. I directed the architecture decisions and reviewed all generated code before committing.
- **Claude** — used to stress-test the Arabic output quality and identify the single-order confidence bug

**How I used them:**
- Prompt iteration: wrote the initial system prompt, tested it against 5 profiles, identified hallucination on unknown products, tightened the `STRICT RULES` block
- Eval grading: ran outputs through Claude to check Arabic naturalness and catch silent JSON failures
- Overruled the agent on: the RAG implementation (agent wanted keyword matching, I enforced cosine similarity with real embeddings), and the confidence scoring logic (agent defaulted to LLM-assigned confidence, I kept it deterministic)

**What worked:** JSON mode in Gemini eliminated most parse failures. Pydantic caught the rest.

**What didn't:** Getting Arabic to read like GCC conversational copy rather than formal MSA required multiple prompt rewrites and is still imperfect.

---

## 📂 Project Structure

```
babytrack-ai-mumzworld/
├── main.py               # FastAPI server + routes + progressive intelligence
├── state_manager.py      # Stage transition detection + state persistence
├── requirements.txt
├── .env.example
├── static/
│   └── index.html        # Frontend UI
├── src/
│   ├── pipeline.py       # Core AI pipeline (signal → RAG → LLM → schema)
│   ├── schema.py         # Pydantic output schema + safe parser
│   ├── rag.py            # Embedding index + cosine retrieval
│   ├── catalog.py        # Product catalog (RAG knowledge base)
│   └── data.py           # Mock mom profiles (10 personas)
├── evals/
│   └── test_pipeline.py  # Automated eval runner
├── EVALS.md              # Full evaluation report
└── README.md
```

---

## ⏱️ Time Log

| Phase | Time |
|---|---|
| Problem selection + architecture design | 45 min |
| Signal detection + RAG pipeline | 90 min |
| LLM prompt + schema validation | 60 min |
| Frontend UI + FastAPI routes | 45 min |
| Evals + documentation | 60 min |
| **Total** | **~5.5 hours** |

Went slightly over 5 hours due to Arabic prompt iteration and fixing the confidence scoring edge cases.
