# 👶 BabyTrack AI | Mumzworld Personalization Engine

BabyTrack AI is a production-grade personalization layer designed for Mumzworld. It uses a **hybrid AI approach** (Heuristics + RAG + LLM) to detect a mother's journey stage based on her purchase history and provide hyper-relevant product recommendations.

---

## 🚀 Key Features

- **Weighted Stage Detection**  
  A scoring algorithm that analyzes order recency and frequency to accurately predict the baby's life stage (e.g., Pregnancy vs. Toddler).

- **RAG (Retrieval-Augmented Generation)**  
  Uses Gemini embeddings to perform semantic search over product data, retrieving context based on intent.

- **Smart Personalization**  
  Powered by `gemini-1.5-flash`, generates warm, bilingual (English/Arabic) responses and predicts replenishment needs.

- **Progressive Intelligence**  
  Adjusts recommendation confidence and density based on signal strength.

- **Reliability & Security**
  - In-memory vector store  
  - API rate limiting  
  - Error boundaries  

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS  
- **Backend**: Node.js (Express), TypeScript  
- **AI/ML**:  
  - `gemini-1.5-flash`  
  - `text-embedding-004`  
- **Validation**: Zod  

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js v18+
- Gemini API key

### 2. Install
```bash
npm install
3. Environment

Create .env file:

GEMINI_API_KEY="your_key"
INTERNAL_API_KEY="secure_token"
4. Run
npm run dev

App runs at:

http://localhost:3000
🧠 Architecture: How It Works
Signal Detection
Parses orders[] and assigns weights based on recency and frequency.
RAG Retrieval
Converts stage into embeddings and retrieves relevant products using cosine similarity.
LLM Synthesis
Uses profile + retrieved products.
Strictly avoids hallucination.
State Persistence
Stores stage in user_states.json.
🧪 Evaluation Summary
Test Case	Scenario	Expected	Result
Newborn signal	Recent diaper	Newborn stage	✅
Pregnancy signal	Maternity items	Pregnancy	✅
Mixed signals	Newborn + Toddler	Low confidence	✅
No data	Empty input	Refuse	✅
Old data	>6 months	Low confidence	✅
Toddler focus	Repeated toddler buys	Toddler	✅
Recency conflict	Old vs new	Recent wins	✅
Sparse data	Weak signal	Low confidence	⚠️
Random items	Irrelevant products	Refuse	✅
Ambiguous case	Mixed unclear	Uncertain	⚠️

Total: 10 test cases
Failures: 2 edge cases

⚖️ Tradeoffs
In-memory vector store instead of scalable DB
Limited dataset
No fine-tuning (time constraint)
Backend-focused over UI polish
Manual evals instead of automated
🧰 Tooling
Models
gemini-1.5-flash
text-embedding-004
Usage
Prompt engineering for recommendations
RAG for grounding
Manual eval testing
What Worked
Strong recommendations
Good bilingual output
Controlled hallucination
What Didn’t
Ambiguity in mixed signals
Limited dataset coverage
Intervention
Tight prompt constraints
Manual output control
⚠️ Limitations
No real production data
No scalable vector DB
Limited Arabic refinement
No advanced UI personalization
🚀 Future Improvements
Add real-time tracking
Use vector DB (Pinecone, etc.)
Improve Arabic fluency
Automate eval pipeline
Expand dataset
🎥 Demo

(Add Loom link here)

📂 Project Structure
/frontend
/backend
/EVALS.md
/README.md