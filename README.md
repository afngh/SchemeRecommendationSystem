# 🔍 SchemeLens — AI Government Scheme Recommendation System

An AI-powered platform that recommends Indian government schemes to citizens using NLP semantic search, and provides a risk analysis engine for government policy evaluation.

---

## 📁 Project Structure

```
CSP Project/
├── backend/
│   ├── api.py                      # FastAPI server — all API endpoints
│   ├── ai_engine.py                # FAISS semantic search + embedding engine
│   ├── prompt_enhancer.py          # Gemini LLM prompt enhancement (LangChain)
│   ├── government_risk_analyzer.py # NLP-based policy risk analysis engine
│   └── setup_database.py           # CSV → SQLite database builder
├── data/
│   ├── schemelens.db               # SQLite database (schemes, feedback, risk scores)
│   ├── scheme_index.faiss          # FAISS vector index
│   ├── scheme_id_mapping.pkl       # FAISS index → scheme_id mapping
│   └── all_schemes_master.csv      # Merged master CSV
├── schemes/                        # Raw category-wise CSV files (scraped data)
├── scraper/                        # Web scraping scripts
├── rd/                             # Research & development notes
├── .env                            # Environment variables (API keys)
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
pip install fastapi uvicorn sentence-transformers faiss-cpu pandas langchain langchain-google-genai python-dotenv
```

### 2. Setup Database

```bash
cd backend
python setup_database.py
```

### 3. Build Vector Database (First time only)

```bash
python ai_engine.py
```

### 4. Configure Gemini API Key (for Premium Search)

Edit the `.env` file in the project root:

```env
GOOGLE_API_KEY=your-gemini-api-key-here
```

> Get your key from: https://aistudio.google.com/apikey

### 5. Start the API Server

```bash
cd backend
uvicorn api:app --reload
```

Server runs at: `http://127.0.0.1:8000`  
Swagger Docs: `http://127.0.0.1:8000/docs`

---

## 📡 API Reference

### Base URL

```
http://127.0.0.1:8000
```

---

### `GET /`

Health check / welcome message.

**Response:**
```json
{
  "message": "Welcome to SchemeLens AI API. Use /docs to see all endpoints."
}
```

---

### `POST /api/recommend` — Normal Search

**For:** Regular / Free users  
**What it does:** Takes the raw query and runs direct FAISS semantic search. No LLM involved.

**Request Body:**
```json
{
  "query": "I need help for my daughter's school fees",
  "top_k": 5
}
```

| Field   | Type   | Required | Default | Description                     |
|---------|--------|----------|---------|---------------------------------|
| `query` | string | ✅       | —       | Natural language search query   |
| `top_k` | int    | ❌       | 5       | Number of results to return     |

**Response:**
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

**cURL:**
```bash
curl -X POST http://127.0.0.1:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "scholarship for engineering students", "top_k": 5}'
```

---

### `POST /api/recommend/premium` — Premium Semantic Search

**For:** Premium users  
**What it does:** Enhances the query using **Gemini LLM via LangChain** to extract intent, demographics, and policy keywords — then runs FAISS semantic search with the enriched context.

> ⚠️ Requires `GOOGLE_API_KEY` to be set in `.env`

**Request Body:**
```json
{
  "query": "I am a single mother looking for help with my daughter's education",
  "top_k": 5
}
```

| Field   | Type   | Required | Default | Description                     |
|---------|--------|----------|---------|---------------------------------|
| `query` | string | ✅       | —       | Natural language search query   |
| `top_k` | int    | ❌       | 5       | Number of results to return     |

**Response:**
```json
{
  "query": "I am a single mother looking for help with my daughter's education",
  "enhanced_query": "education scholarship financial assistance single mother girl child student school fees tuition women empowerment BPL SC ST OBC Education Learning welfare",
  "search_type": "premium",
  "results": [
    {
      "scheme_id": "abc12345",
      "title": "...",
      "category": "...",
      "description": "...",
      "tags": "...",
      "link": "..."
    }
  ]
}
```

**cURL:**
```bash
curl -X POST http://127.0.0.1:8000/api/recommend/premium \
  -H "Content-Type: application/json" \
  -d '{"query": "I am a widow and need pension support", "top_k": 5}'
```

**Error (503) — Gemini not configured:**
```json
{
  "detail": "Premium search is temporarily unavailable. Gemini API key may not be configured."
}
```

---

### `POST /api/rate` — Rate a Scheme

Submit a user rating (1-5 stars) and optional feedback for a scheme.

**Request Body:**
```json
{
  "scheme_id": "abc12345",
  "rating": 4,
  "feedback": "Very helpful scheme, easy to apply!"
}
```

| Field       | Type   | Required | Default | Description                        |
|-------------|--------|----------|---------|------------------------------------|
| `scheme_id` | string | ✅       | —       | ID of the scheme to rate           |
| `rating`    | int    | ✅       | —       | Rating from 1 to 5                 |
| `feedback`  | string | ❌       | `""`    | Optional text feedback             |

**Response:**
```json
{
  "message": "Feedback submitted successfully!"
}
```

**cURL:**
```bash
curl -X POST http://127.0.0.1:8000/api/rate \
  -H "Content-Type: application/json" \
  -d '{"scheme_id": "abc12345", "rating": 5, "feedback": "Great scheme!"}'
```

---

### `GET /api/top-rated` — Top Rated Schemes

Fetches the highest-rated schemes based on average user feedback.

**Query Parameters:**

| Param   | Type | Required | Default | Description                   |
|---------|------|----------|---------|-------------------------------|
| `limit` | int  | ❌       | 5       | Number of top results         |

**Response:**
```json
{
  "top_rated": [
    {
      "scheme_id": "abc12345",
      "title": "Pradhan Mantri Ujjwala Yojana",
      "category": "Welfare Of Families",
      "description": "...",
      "link": "...",
      "avg_rating": 4.8,
      "total_reviews": 12
    }
  ]
}
```

**cURL:**
```bash
curl http://127.0.0.1:8000/api/top-rated?limit=10
```

---

## 🏛️ Government Risk Analyzer (CLI)

A separate CLI tool for government officials to analyze policy risks.

```bash
cd backend
python government_risk_analyzer.py
```

**Menu Options:**

| Option | Description |
|--------|-------------|
| 1      | **Run Full Risk Analysis** — Analyzes all 4,500+ schemes using 5 NLP algorithms and saves scores to the database |
| 2      | **Search Risky Schemes by Tags** — Interactive tag-based search (e.g., `education, women`, `agriculture rural subsidy`) |
| 3      | Exit |

### Risk Algorithms

| # | Algorithm              | What it detects                                      |
|---|------------------------|------------------------------------------------------|
| 1 | Accessibility Risk     | High documentation barriers, online-only access      |
| 2 | Bureaucratic Risk      | Red tape, multiple departments, approval delays      |
| 3 | Market Distortion Risk | Handout dependency vs. empowerment balance           |
| 4 | Ecological Risk        | Environmental threats (agriculture/industry schemes) |
| 5 | Social Friction Risk   | Demographic filtering causing social tension         |

---

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (TBD)                    │
└────────────────────────┬────────────────────────────┘
                         │
                    HTTP Requests
                         │
┌────────────────────────▼────────────────────────────┐
│                  api.py (FastAPI)                    │
│                                                     │
│  /api/recommend          → Normal FAISS search      │
│  /api/recommend/premium  → Gemini + FAISS search    │
│  /api/rate               → Save user feedback       │
│  /api/top-rated          → Fetch top rated schemes  │
└──────┬──────────────────────────────┬───────────────┘
       │                              │
       ▼                              ▼
┌──────────────┐        ┌─────────────────────────┐
│  ai_engine   │        │   prompt_enhancer       │
│              │        │                         │
│ SentenceTF   │◄───────│  Gemini LLM (LangChain) │
│ FAISS Index  │        │  Query Enhancement      │
└──────┬───────┘        └─────────────────────────┘
       │
       ▼
┌──────────────┐
│  SQLite DB   │
│ schemelens.db│
└──────────────┘
```

---

## 🔑 Environment Variables

| Variable         | Required | Description                     |
|------------------|----------|---------------------------------|
| `GOOGLE_API_KEY` | For premium search | Gemini API key from Google AI Studio |

---

## 📊 Database Schema

### `schemes` table
| Column      | Type | Description              |
|-------------|------|--------------------------|
| scheme_id   | TEXT | Primary key (UUID)       |
| title       | TEXT | Scheme name              |
| category    | TEXT | Category (14 categories) |
| description | TEXT | Full description         |
| tags        | TEXT | Comma-separated keywords |
| link        | TEXT | URL to myscheme.gov.in   |

### `feedback` table
| Column        | Type     | Description                |
|---------------|----------|----------------------------|
| id            | INTEGER  | Auto-increment primary key |
| scheme_id     | TEXT     | Foreign key → schemes      |
| rating        | INTEGER  | 1-5 stars                  |
| user_feedback | TEXT     | Optional text feedback     |
| timestamp     | DATETIME | Auto-generated             |

### `government_risk_analysis` table
| Column                 | Type | Description                     |
|------------------------|------|---------------------------------|
| scheme_id              | TEXT | Primary key, FK → schemes       |
| accessibility_risk     | REAL | Score 0-10                      |
| bureaucratic_risk      | REAL | Score 0-10                      |
| market_distortion_risk | REAL | Score 0-10                      |
| ecological_risk        | REAL | Score 0-10                      |
| social_friction_risk   | REAL | Score 0-10                      |
| composite_risk_score   | REAL | Average of all 5 scores (0-10)  |
