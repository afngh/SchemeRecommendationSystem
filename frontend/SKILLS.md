# SKILL.md — SchemeLens Frontend (React JS)

## Project Overview

Build the frontend for **SchemeLens** — an AI-powered Indian government scheme recommendation system. The backend (FastAPI + FAISS + Gemini LLM) is already built with 4,500+ real schemes scraped from myscheme.gov.in. The frontend must connect to the live API and provide two portals: **Citizen Portal** (search & discover schemes) and **Government Dashboard** (risk analysis of policies).

---

## Backend API Reference (Already Built — Connect To These)

**Base URL:** `http://127.0.0.1:8000`

### Citizen Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/recommend` | Normal FAISS semantic search (free users) |
| `POST` | `/api/recommend/premium` | Gemini-enhanced semantic search (premium) |
| `POST` | `/api/rate` | Submit rating (1-5) + feedback for a scheme |
| `GET` | `/api/top-rated?limit=N` | Fetch top-rated schemes by avg user rating |

### Government Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/gov/risky-schemes?category=X&limit=N&min_risk=F` | Top risky schemes by composite score |
| `POST` | `/api/gov/risky-schemes/search` | Tag-based risk search |
| `GET` | `/api/gov/risk-summary` | Aggregate risk stats per category |

### Request/Response Shapes

**POST `/api/recommend`** (Normal Search):
```json
// Request
{ "query": "I need help for my daughter's school fees", "top_k": 5 }

// Response
{
  "query": "...",
  "search_type": "normal",
  "results": [
    {
      "scheme_id": "9c6243cc",
      "title": "Post-Matric Scholarship for SC Students",
      "category": "Education Learning",
      "description": "Financial assistance to SC students...",
      "tags": "Scholarship, Student, Financial Assistance, SC",
      "link": "https://www.myscheme.gov.in/schemes/..."
    }
  ]
}
```

**POST `/api/recommend/premium`** (Premium Search):
```json
// Request
{ "query": "I am a single mother looking for help", "top_k": 5 }

// Response — same as normal but with enhanced_query field
{
  "query": "...",
  "enhanced_query": "education scholarship financial assistance single mother girl child...",
  "search_type": "premium",
  "results": [ /* same scheme shape */ ]
}
```

**POST `/api/rate`**:
```json
// Request
{ "scheme_id": "abc12345", "rating": 4, "feedback": "Very helpful!" }
// Response
{ "message": "Feedback submitted successfully!" }
```

**GET `/api/gov/risky-schemes`**:
```json
{
  "filter": { "category": "Agriculture", "min_risk": 2.0, "limit": 5 },
  "total_results": 2,
  "risky_schemes": [
    {
      "scheme_id": "2ed2bbcd",
      "title": "Goat Rearing Scheme",
      "category": "Agriculture",
      "tags": "Women, BPL, Disability, Scheduled Tribe, Farmer",
      "link": "...",
      "accessibility_risk": 0.0,
      "bureaucratic_risk": 0.0,
      "market_distortion_risk": 7.0,
      "ecological_risk": 1.0,
      "social_friction_risk": 6.0,
      "composite_risk_score": 2.8
    }
  ]
}
```

**POST `/api/gov/risky-schemes/search`**:
```json
// Request
{ "tags": "education, women", "top_n": 5 }
// Response
{
  "tags": "education, women",
  "total_results": 5,
  "risky_schemes": [
    {
      "scheme_id": "c20b303b",
      "title": "Sukhad Sahara Yojana",
      "category": "Benefits Social",
      "description": "...",
      "tags": "Widow, Deserted Woman, BPL, Financial Assistance",
      "composite_risk_score": 3.2,
      "tag_relevance": 1
    }
  ]
}
```

**GET `/api/gov/risk-summary`**:
```json
{
  "overall": {
    "total_schemes": 4580,
    "overall_avg_risk": 1.34,
    "overall_max_risk": 3.3,
    "total_high_risk": 8,
    "total_medium_risk": 670,
    "total_low_risk": 3902
  },
  "by_category": [
    {
      "category": "Justice Law Grievances",
      "total_schemes": 12,
      "avg_risk": 1.67,
      "max_risk": 2.4,
      "min_risk": 0.6,
      "high_risk_count": 0,
      "medium_risk_count": 4,
      "low_risk_count": 8
    }
  ]
}
```

---

## Real Database Schema (DO NOT USE MOCK DATA)

The actual scheme object from the API has exactly these fields:

```ts
interface Scheme {
  scheme_id: string;   // UUID like "9c6243cc"
  title: string;       // e.g. "PM Vishwakarma Yojana"
  category: string;    // one of the 14 categories below
  description: string; // full scheme description
  tags: string;        // comma-separated: "Scholarship, Student, SC, Financial Assistance"
  link: string;        // URL to myscheme.gov.in page
}
```

### 14 Real Categories (from the database)

```
Agriculture, Benefits Social, Business Self Employed,
Driving Transport, Education Learning, Health Wellness,
Housing Local Services, Jobs, Justice Law Grievances,
Money Taxes, Science It Communication, Travel Tourism,
Welfare Of Families, Youth Sports Culture
```

### Risk Score Fields (government endpoints only)

```ts
interface RiskScheme extends Scheme {
  accessibility_risk: number;       // 0-10
  bureaucratic_risk: number;        // 0-10
  market_distortion_risk: number;   // 0-10
  ecological_risk: number;          // 0-10
  social_friction_risk: number;     // 0-10
  composite_risk_score: number;     // average of all 5 (0-10)
}
```

Risk levels: 🟢 Low (<2.0) | 🟡 Medium (2.0–2.99) | 🔴 High (≥3.0)

---

## Visual Design Reference (Lightdash-Inspired)

### Layout & Structure

- **Full-width navbar** with logo (lightning bolt + text), nav links with dropdown chevrons, and right-aligned CTA buttons
- **Announcement banner** at very top: dark background, short text, link
- **Hero section**: Large bold display heading, subtitle paragraph (muted gray), two CTA buttons
- **Decorative pixel/mosaic** element in top-right corner of hero: scattered colored squares in brand purple tones
- **Feature sections**: Left text panel + Right UI mockup/screenshot panel
- **3-column feature grid**: icon + heading + 2-line description per cell
- **Testimonial/quote section**: Large centered italic quote with attribution
- **Logo strip**: Greyscale ministry/department logos as text
- **Dark CTA footer band**: dark background with large heading + two buttons
- **Footer**: Dark background, logo, newsletter signup, 3-column links, social icons

### Color Palette (CSS Variables — MUST USE)

```css
:root {
  --brand-primary: #1a1a2e;
  --brand-accent: #6366f1;
  --brand-accent-light: #a5b4fc;
  --brand-pixel-1: #7c3aed;
  --brand-pixel-2: #a78bfa;
  --brand-pixel-3: #ddd6fe;
  --bg-white: #ffffff;
  --bg-light: #f8f8fb;
  --bg-dark: #0f0f1a;
  --text-primary: #1a1a2e;
  --text-muted: #6b7280;
  --text-light: #9ca3af;
  --border: #e5e7eb;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

### Typography

- **Heading font**: `'Fraunces'` — bold, editorial, trustworthy government feel
- **Body font**: `'DM Sans'` — clean, modern, readable
- Load via: `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@400;500;600&display=swap')`
- Hero h1: `font-family: 'Fraunces'; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; line-height: 1.1`
- Body: `font-family: 'DM Sans'; font-size: 1rem; line-height: 1.6`

### Component Patterns

- **Buttons**:
  - Primary (filled dark): `background: #1a1a2e; color: white; border-radius: 6px; padding: 10px 20px; font-weight: 600`
  - Ghost (outline): `background: transparent; border: 1.5px solid #e5e7eb; border-radius: 6px; padding: 10px 20px`
  - Accent (purple): `background: #6366f1; color: white; border-radius: 6px`
- **Cards**: `background: white; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 20px`
- **Pixel decoration**: Scattered `8px`/`12px`/`16px`/`24px` squares positioned absolutely top-right, colors from brand-pixel-1/2/3

---

## Application Features & Pages

### Page 1: Landing Page (`/`)

**Hero Section:**
- Headline: "Discover Government Schemes **Made for You** ✦"
- Subheadline: "AI-powered search across 4,500+ real Indian government schemes — matched to your profile in seconds using semantic NLP."
- CTAs: "Find My Schemes" → `/recommend` (dark filled) + "Browse Risk Analysis" → `/gov/dashboard` (ghost)
- Pixel mosaic decoration: top-right

**Toggle Demo Preview:**
- Pill toggle: "For Citizens" | "For Officials"
- Citizens view: mocked scheme card results preview
- Officials view: mocked risk dashboard preview

**Features grid (3 columns):**
1. 🔍 AI Semantic Search — FAISS-powered NLP matches your natural language query to 4,500+ real schemes
2. ⚡ Premium Gemini Enhancement — Gemini LLM enriches your query with policy keywords for superior results
3. ⚠️ Policy Risk Analysis — 5 NLP algorithms score every scheme on accessibility, bureaucracy, market distortion, ecology & social friction

**Social proof:**
- "Powered by real data from myscheme.gov.in"
- Text logos: myScheme.gov.in, NIC, PFMS, NSP, DBT

**"How it works" 3-step flow:**
1. Describe your situation in natural language
2. Our AI searches 4,500+ schemes using semantic vectors
3. Get personalized results ranked by relevance

**Dark CTA band:**
"Ready to find your benefits?" with "Find My Schemes" + "Government Dashboard" buttons

### Page 2: Scheme Recommendation Page (`/recommend`)

- Hero: "Tell us about yourself ✦"
- **Search Mode Toggle**: "Normal Search" (free) | "Premium AI Search" (Gemini-enhanced)
  - Normal → calls `POST /api/recommend`
  - Premium → calls `POST /api/recommend/premium`
- **AI Prompt Box**: Large textarea with:
  - Placeholder: "e.g. I am a 19-year-old SC student from Telangana, annual family income ₹1.8 lakhs, studying B.Tech first year..."
  - Sparkle icon + "Find Schemes" button
  - Focus glow: `box-shadow: 0 0 0 3px rgba(99,102,241,0.15)`
- **Quick filter chips**: [Student] [Farmer] [Woman] [Senior Citizen] [Disabled] [BPL]
  - Clicking a chip appends text to the textarea
- **Results area** (after submit):
  - Show skeleton loading (3 shimmer cards) during API call
  - If premium: show the `enhanced_query` in a collapsible "AI Enhancement" panel
  - Scheme cards showing: title, category badge, description (truncated), tags as pills, "Visit Scheme →" link button
  - Each card has a ⭐ Rate button → opens inline rating widget (1-5 stars + optional feedback textarea) → calls `POST /api/rate`

### Page 3: Government Risk Dashboard (`/gov/dashboard`)

**This is the government official view — NOT citizen-facing.**

- **Risk Summary Section** (calls `GET /api/gov/risk-summary` on mount):
  - Top stats cards: Total Schemes | Avg Risk | High Risk Count | Medium Risk Count
  - Category breakdown table: category name, total schemes, avg/max/min risk, high/medium/low counts
  - Color-coded rows: red bg for high-risk categories, amber for medium, green for low

- **Tag-Based Risk Search** (calls `POST /api/gov/risky-schemes/search`):
  - Search input with tag chips
  - Results: scheme cards with risk score badge, 5 individual risk bars, composite score

- **Top Risky Schemes Browser** (calls `GET /api/gov/risky-schemes`):
  - Filter bar: Category dropdown (14 categories) | Min Risk slider | Limit selector
  - Scheme cards with:
    - Red/amber/green left border based on composite score
    - 5 individual risk scores shown as mini horizontal bars
    - Composite score badge (🔴/🟡/🟢)
    - Link to myscheme.gov.in

### Page 4: Top Rated Schemes (`/top-rated`)

- Calls `GET /api/top-rated?limit=20` on mount
- Grid of scheme cards showing: avg_rating (stars), total_reviews count, title, category, description
- Sort options: By Rating | By Review Count

### Page 5: About / How It Works (`/about`)

- Architecture diagram (text/SVG): User → FastAPI → FAISS/Gemini → SQLite
- Tech stack cards: FastAPI, FAISS, Sentence Transformers, Gemini, LangChain, SQLite
- 5 Risk Algorithms explained with icons

---

## React Component Architecture

```
App.jsx
├── components/
│   ├── Navbar.jsx              — logo, nav links, CTA buttons, mobile hamburger
│   ├── AnnouncementBanner.jsx  — dark top bar, dismissible
│   ├── Footer.jsx              — dark footer, links, social
│   ├── SchemeCard.jsx          — reusable card for any scheme result
│   ├── RiskSchemeCard.jsx      — scheme card with risk scores visualization
│   ├── PixelDecoration.jsx     — scattered colored squares (hero decoration)
│   ├── AIPromptBox.jsx         — textarea + submit + quick chips + mode toggle
│   ├── RatingWidget.jsx        — 1-5 star rating + feedback textarea
│   ├── CategoryBadge.jsx       — colored pill for scheme category
│   ├── RiskBar.jsx             — horizontal bar visualization for risk scores
│   ├── RiskSummaryCards.jsx    — top-level stats cards for risk dashboard
│   ├── SkeletonCard.jsx        — gray shimmer loading card
│   └── SearchModeToggle.jsx    — Normal/Premium pill toggle
└── pages/
    ├── Landing.jsx
    ├── Recommend.jsx
    ├── GovDashboard.jsx
    ├── TopRated.jsx
    └── About.jsx
```

---

## Icons (lucide-react)

```js
import {
  Sparkles,        // AI / premium search
  AlertTriangle,   // risk warning
  Search,          // search bar
  BookOpen,        // education
  Home,            // housing
  Heart,           // health
  Wheat,           // agriculture
  Users,           // welfare / families
  Shield,          // security / justice
  ChevronDown,     // nav dropdowns
  ArrowRight,      // CTA arrows
  Star,            // ratings
  Bell,            // alerts
  Filter,          // filter bar
  ExternalLink,    // visit scheme link
  Zap,             // logo / lightning
  Menu,            // mobile hamburger
  CheckCircle2,    // low risk
  Clock,           // deadline
  TrendingDown,    // risk indicator
  MapPin,          // state/location
  GraduationCap,   // education category
  Briefcase,       // jobs / business
  BarChart3,       // risk dashboard charts
  Activity,        // risk analysis
  Crown,           // premium search
  ThumbsUp,        // feedback
  X                // close / dismiss
} from 'lucide-react'
```

**Logo**: Use `<Zap size={20} />` + "SchemeLens" text.

---

## Pixel Decoration Component

```jsx
const pixels = [
  { size: 48, x: '85%', y: '5%',  color: '#7c3aed', opacity: 1 },
  { size: 32, x: '90%', y: '2%',  color: '#4f46e5', opacity: 1 },
  { size: 16, x: '80%', y: '12%', color: '#a78bfa', opacity: 0.8 },
  { size: 24, x: '88%', y: '18%', color: '#7c3aed', opacity: 0.6 },
  { size: 12, x: '76%', y: '8%',  color: '#ddd6fe', opacity: 1 },
  { size: 8,  x: '93%', y: '14%', color: '#6366f1', opacity: 0.4 },
  { size: 20, x: '82%', y: '22%', color: '#a78bfa', opacity: 0.5 },
  { size: 16, x: '95%', y: '8%',  color: '#ddd6fe', opacity: 0.7 },
  { size: 8,  x: '78%', y: '18%', color: '#7c3aed', opacity: 0.3 },
  { size: 12, x: '91%', y: '25%', color: '#4f46e5', opacity: 0.6 },
]

export default function PixelDecoration() {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', overflow: 'hidden', pointerEvents: 'none' }}>
      {pixels.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.x, top: p.y,
          width: p.size, height: p.size,
          backgroundColor: p.color,
          opacity: p.opacity,
          animation: i % 2 === 0 ? 'pixelFloat 3s ease-in-out infinite' : 'pixelFloat 4s ease-in-out infinite reverse'
        }} />
      ))}
    </div>
  )
}
// CSS: @keyframes pixelFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
```

---

## API Integration Patterns

### Fetching Recommendations

```jsx
// Normal search
const searchSchemes = async (query, topK = 5) => {
  const res = await fetch('http://127.0.0.1:8000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK })
  });
  return res.json(); // { query, search_type: "normal", results: [...] }
};

// Premium search (Gemini-enhanced)
const searchPremium = async (query, topK = 5) => {
  const res = await fetch('http://127.0.0.1:8000/api/recommend/premium', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK })
  });
  if (res.status === 503) throw new Error('Premium search unavailable');
  return res.json(); // { query, enhanced_query, search_type: "premium", results: [...] }
};
```

### Submitting Ratings

```jsx
const rateScheme = async (schemeId, rating, feedback = '') => {
  const res = await fetch('http://127.0.0.1:8000/api/rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheme_id: schemeId, rating, feedback })
  });
  return res.json();
};
```

### Fetching Risk Data

```jsx
// Risk summary (for dashboard overview)
const getRiskSummary = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/gov/risk-summary');
  return res.json(); // { overall: {...}, by_category: [...] }
};

// Risky schemes with filters
const getRiskySchemes = async (category = null, limit = 20, minRisk = 0) => {
  const params = new URLSearchParams({ limit, min_risk: minRisk });
  if (category) params.append('category', category);
  const res = await fetch(`http://127.0.0.1:8000/api/gov/risky-schemes?${params}`);
  return res.json();
};

// Tag-based risk search
const searchRiskyByTags = async (tags, topN = 10) => {
  const res = await fetch('http://127.0.0.1:8000/api/gov/risky-schemes/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags, top_n: topN })
  });
  return res.json();
};
```

---

## Skeleton Loading

```jsx
// SkeletonCard.jsx — shown while API responds
// CSS: @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
// background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)
// background-size: 200% 100%
// animation: shimmer 1.5s infinite
```

---

## Responsive Rules

```css
@media (max-width: 768px) {
  .nav-links { display: none; }
  .hamburger { display: block; }
  h1 { font-size: 2.2rem; }
  .pixel-decoration { display: none; }
  .hero-buttons { flex-direction: column; }
  .feature-grid { grid-template-columns: 1fr; }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
@media (max-width: 640px) {
  .cards-grid { grid-template-columns: 1fr; }
}
```

---

## Build Order

1. Create `globals.css` — variables, fonts, base reset, keyframes
2. Create API utility file (`api.js`) — all fetch functions
3. Build `SchemeCard.jsx` — most reused component
4. Build `RiskSchemeCard.jsx` — scheme card with risk bars
5. Build `Navbar.jsx` — desktop + mobile
6. Build `PixelDecoration.jsx` — visual flair
7. Build `Landing.jsx` — hero + features + CTA
8. Build `Recommend.jsx` — AI prompt box + normal/premium toggle + results
9. Build `GovDashboard.jsx` — risk summary + tag search + risky schemes browser
10. Build `TopRated.jsx` — top rated schemes grid
11. Build `Footer.jsx` — dark footer
12. Wire up routing in `App.jsx`
13. Test responsive at 375px, 768px, 1280px

---

## Quality Bar

- Clean whitespace, no cramped elements
- Consistent border-radius (6px buttons, 12px cards)
- Hover states on every interactive element (`transition: all 0.15s`)
- Text hierarchy clear: h1 > h2 > label > body > muted
- No broken layouts at any screen size
- All data fetched from the real API — NO hardcoded mock scheme data
- Error handling for API failures (503 for premium, 404 for missing schemes)
- Loading states (skeleton cards) for every API call
- Pixel decoration visible and animated on desktop hero
