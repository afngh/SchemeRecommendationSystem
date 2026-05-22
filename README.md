# 🔍 SchemeLens — AI Government Scheme Recommendation System

An AI-powered citizen discovery and government auditing platform that recommends Indian government schemes to citizens using FAISS NLP semantic vector search, and provides a multi-dimensional risk analysis engine for policy makers.

---

## 🛠️ Tech Stack & Prerequisites

### Core Technology Stack
* **Backend API Engine**: Python (3.10+), FastAPI (asynchronous REST API framework), SQLite (local database), and Uvicorn.
* **Vector Semantic Search**: FAISS (Facebook AI Similarity Search) and SentenceTransformers (`all-MiniLM-L6-v2` embeddings).
* **Smart Prompt Enrichment**: Google Gemini LLM API via LangChain Core.
* **Frontend Portal Client**: Next.js 16 (React 19 framework), TailwindCSS, and Lucide React.
* **Identity Management**: Clerk Authentication (multi-tenant email/Google login, OAuth, and user profile manager).
* **Database Synchronization**: Supabase Postgres Client (dynamic citizen demographic profiles & developer API keys database sync).

### What to Download & Install
To run this application locally, download and install the following packages:
1. **Python (version >= 3.10)**: [Download Python](https://www.python.org/downloads/) (Make sure to check "Add Python to PATH" during installation).
2. **Node.js (version >= 20.0)** & **npm**: [Download Node.js](https://nodejs.org/) (Includes npm).
3. **Git**: [Download Git](https://git-scm.com/) (For cloning and repository sync).

---

## 📁 Unified Project Structure

```
CSP Project/
├── backend/
│   ├── api.py                      # FastAPI server — REST endpoints & Heuristic Auditing
│   ├── ai_engine.py                # FAISS semantic search + embedding engine
│   ├── prompt_enhancer.py          # Gemini LLM prompt enhancement (LangChain)
│   ├── government_risk_analyzer.py # NLP-based policy risk analysis engine
│   └── setup_database.py           # CSV → SQLite database builder
├── data/
│   ├── schemelens.db               # SQLite database (schemes, feedback, risk scores)
│   ├── scheme_index.faiss          # FAISS vector index
│   ├── scheme_id_mapping.pkl       # FAISS index → scheme_id mapping
│   └── all_schemes_master.csv      # Merged master CSV
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── recommend/          # FAISS Search & Premium Gemini Match UI
│   │   │   ├── gov/dashboard/      # Policy Risk Auditor Sandbox Panel
│   │   │   ├── top-rated/          # Dynamic Citizen-Ranked Schemes List
│   │   │   ├── delivery/           # WhatsApp, Telegram Bot, & n8n webhook settings
│   │   │   ├── developer/          # API Key generator & Swagger Sandbox console
│   │   │   ├── profile/            # Demographic settings synced via Supabase
│   │   │   └── page.js             # Vercel-style landing page
│   │   └── utils/
│   │       ├── supabase.js         # Stale-cache free dynamic Supabase client
│   │       └── delivery.js         # Twilio/Webhook dispatch utilities
│   ├── .env.local                  # Frontend environment settings (Clerk + Supabase)
│   └── package.json                # Next.js 16 (Turbopack) settings
├── schemes/                        # Raw category-wise CSV files (scraped data)
├── scraper/                        # Web scraping scripts
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Backend Dependencies & Initialize DB

```bash
# Install core Python dependencies
pip install fastapi uvicorn sentence-transformers faiss-cpu pandas langchain langchain-google-genai python-dotenv

# Initialize SQLite database
cd backend
python setup_database.py

# Compile SentenceTransformers FAISS vector indexes (First time only)
python ai_engine.py
```

### 2. Configure Environment Keys

#### Backend Setup (`.env` in root)
```env
GOOGLE_API_KEY=your-gemini-api-key-here
```
> Get your key from: https://aistudio.google.com/apikey

#### Frontend Setup (`frontend/.env.local`)
Create a `.env.local` inside the `frontend` folder:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start the Platform Services

```bash
# Terminal 1: Run the FastAPI backend service
cd backend
uvicorn api:app --reload

# Terminal 2: Start the Next.js (Turbopack) frontend portal
cd frontend
npm install
npm run dev
```

* **FastAPI Endpoint Docs**: `http://127.0.0.1:8000/docs`
* **Citizen Frontend Portal**: `http://localhost:3000`

---

## 📡 API Reference

### Base URL
```
http://127.0.0.1:8000
```

---

### `POST /api/recommend` — Normal Vector Search
Takes raw search prompts and runs cosine similarity matching using direct local SentenceTransformers over FAISS.

* **Request Body:**
```json
{
  "query": "I need help for my daughter's school fees",
  "top_k": 5
}
```
* **Response:**
```json
{
  "query": "I need help for my daughter's school fees",
  "search_type": "normal",
  "results": [
    {
      "scheme_id": "abc12345",
      "title": "National Scholarship Portal",
      "category": "Education Learning",
      "description": "...",
      "tags": "Scholarship, Student, Financial Assistance",
      "link": "https://www.myscheme.gov.in/schemes/..."
    }
  ]
}
```

---

### `POST /api/recommend/premium` — Smart LLM Search
Uses Google Gemini models via LangChain to enrich the query with relevant synonyms, policy keywords, and demographic tags, then returns faiss matches.

* **Request Body:**
```json
{
  "query": "I am a single mother looking for help with my daughter's education",
  "top_k": 5
}
```
* **Response:**
```json
{
  "query": "I am a single mother looking for help with my daughter's education",
  "enhanced_query": "education scholarship financial assistance single mother girl child student school fees tuition BPL SC ST OBC",
  "search_type": "premium",
  "results": [...]
}
```

---

### `POST /api/gov/custom-risk` — Policy Risk Sandbox
Audits schemes against natural language risk descriptions and custom risk parameter weights.

> [!NOTE]
> **Heuristic Resiliency Fallback**: If your Google Gemini API key hits strict free-tier rate limits (`429 RESOURCE_EXHAUSTED`), the backend gracefully catches the exception and immediately falls back to a **high-fidelity local offline heuristic semantic keywords auditor**. The sandbox never crashes and returns immediate results marked with `[Local Offline Heuristics]`.

* **Request Body:**
```json
{
  "prompt": "Find schemes that could lead to extreme water waste",
  "accessibility_weight": 0.2,
  "bureaucratic_weight": 0.2,
  "market_distortion_weight": 0.2,
  "ecological_weight": 0.2,
  "social_friction_weight": 0.2,
  "limit": 5
}
```

---

## 💻 Premium Portal Features

### 🔍 Centered AI Match Portal (`/recommend`)
* **Dual Toggles**: A sleek segment control design switching between `Normal Vector` (light mode active border) and `Smart LLM Enhanced` (premium dark slate background).
* **Profile Sync Status**: Automatically displays a Vercel-style matching profile banner with a pulsing active status. Allows instant redirects to customize parameters.

### 🏆 Ranked Schemes Portal (`/top-rated`)
* Dynamic rankings compiled dynamically from live SQLite citizen utility ratings (`GET /api/top-rated`).
* Star widgets, review counters, and streamlined, button-like `Official Portal` details redirect links.

### 📱 Omnichannel Alert Delivery (`/delivery`)
* **Twilio WhatsApp Integration**: Deliver matches directly via WhatsApp.
* **Telegram Connection Bot**: Interactive setup with `@SchemeLensBot` via transient connection tokens to retrieve chat IDs.
* **n8n Automation Sandbox**: Submit test payloads to active n8n automation webhook instances.

### 🔑 Developer Key Playground (`/developer`)
* **Credential Generator**: Generate, list, and revoke staging/live API credentials synced to Supabase profile states.
* **OpenAPI sandbox**: Dynamic Swagger-style request execution panel to inspect real-time JSON payloads, endpoint latency, and success rates.

### 👤 Profile Preferences Sync (`/profile`)
* Dynamic caste, state, and occupations data bindings saved instantly in your Supabase postgres `profiles` table.
* Integrates all security, email, and social credential management directly using Clerk's embedded `UserProfile` components.

---

## 🏛️ Government Risk Analyzer CLI

Launch a dedicated command line dashboard to execute deep NLP policy audits across the entire database:

```bash
cd backend
python government_risk_analyzer.py
```

### Risk Dimension Matrix
| Dimension | NLP Model Focus | What it Evaluates |
|---|---|---|
| **1. Accessibility** | Vocabulary & Docs Density | Documentation overhead and exclusion barriers. |
| **2. Bureaucratic** | Ministry/Dept Complexity | Red tape, multiple approvals, and processing delays. |
| **3. Market Distortion** | Handout vs Credit ratio | Subsidy-driven market dependence vs enablement. |
| **4. Ecological** | Resource Consumption Tags | Resource drain, water waste, and greenhouse footprints. |
| **5. Social Friction** | Caste/Demographic filtering | Disproportionate target parameters causing friction. |
