from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import Optional, List

# Import our AI Engine
from ai_engine import AIEngine, DB_PATH

# Initialize the FastAPI app
app = FastAPI(
    title="SchemeLens AI API",
    description="Backend API for the SchemeLens Government Scheme Recommendation System",
    version="1.0.0"
)

# Enable CORS so our frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI Engine when the server starts
engine = AIEngine()
engine.load_vector_db()

# ---- Request Models ----
class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class RatingRequest(BaseModel):
    scheme_id: str
    rating: int
    feedback: Optional[str] = ""

class TagSearchRequest(BaseModel):
    tags: str  # Comma or space separated tags, e.g. "education, women"
    top_n: Optional[int] = 10

# ---- API Endpoints ----

@app.get("/")
def read_root():
    return {"message": "Welcome to SchemeLens AI API. Use /docs to see all endpoints."}

@app.post("/api/recommend")
def recommend_normal(request: QueryRequest):
    """
    NORMAL SEARCH (Free / Regular Users)
    Takes a natural language query and runs direct FAISS semantic search
    using the raw query — no LLM enhancement.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        # Direct FAISS search with the raw query (no Gemini enhancement)
        recommendations = engine.recommend_schemes(
            request.query,
            top_k=request.top_k,
            enhanced_query=request.query  # Pass raw query to skip internal enhancement
        )

        return {
            "query": request.query,
            "search_type": "normal",
            "results": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/premium")
def recommend_premium(request: QueryRequest):
    """
    PREMIUM SEMANTIC SEARCH (Premium Users)
    Enhances the query using Gemini LLM via LangChain to extract intent,
    demographics, and policy keywords — then runs FAISS semantic search
    with the enriched context for significantly better results.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        # Step 1: Enhance the query using Gemini LLM
        enhanced_query = None
        if engine.enhancer:
            enhanced_query = engine.enhancer.enhance(request.query)
        
        if not enhanced_query:
            raise HTTPException(
                status_code=503,
                detail="Premium search is temporarily unavailable. Gemini API key may not be configured."
            )

        # Step 2: FAISS semantic search with the enhanced query
        recommendations = engine.recommend_schemes(
            request.query,
            top_k=request.top_k,
            enhanced_query=enhanced_query
        )

        return {
            "query": request.query,
            "enhanced_query": enhanced_query,
            "search_type": "premium",
            "results": recommendations
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rate")
def rate_scheme(request: RatingRequest):
    """
    Saves a user rating (1-5 stars) and optional feedback for a scheme.
    """
    if request.rating < 1 or request.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
        
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verify the scheme exists
        cursor.execute("SELECT 1 FROM schemes WHERE scheme_id = ?", (request.scheme_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Scheme not found.")
            
        # Insert feedback
        cursor.execute('''
        INSERT INTO feedback (scheme_id, rating, user_feedback)
        VALUES (?, ?, ?)
        ''', (request.scheme_id, request.rating, request.feedback))
        
        conn.commit()
        conn.close()
        return {"message": "Feedback submitted successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/top-rated")
def get_top_rated_schemes(limit: int = 5):
    """
    Fetches the top-rated schemes based on average user feedback.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = '''
        SELECT s.scheme_id, s.title, s.category, s.description, s.link, 
               AVG(f.rating) as avg_rating, COUNT(f.id) as total_reviews
        FROM schemes s
        JOIN feedback f ON s.scheme_id = f.scheme_id
        GROUP BY s.scheme_id
        ORDER BY avg_rating DESC, total_reviews DESC
        LIMIT ?
        '''
        
        cursor.execute(query, (limit,))
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"top_rated": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# GOVERNMENT RISK ANALYSIS ENDPOINTS
# ============================================================

@app.get("/api/gov/risky-schemes")
def get_risky_schemes(category: Optional[str] = None, limit: int = 20, min_risk: float = 0.0):
    """
    Fetch top risky schemes sorted by composite risk score (highest first).
    Optionally filter by category and minimum risk threshold.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if category:
            query = '''
                SELECT s.scheme_id, s.title, s.category, s.tags, s.link,
                       r.accessibility_risk, r.bureaucratic_risk, 
                       r.market_distortion_risk, r.ecological_risk,
                       r.social_friction_risk, r.composite_risk_score
                FROM schemes s
                JOIN government_risk_analysis r ON s.scheme_id = r.scheme_id
                WHERE LOWER(s.category) = LOWER(?)
                  AND r.composite_risk_score >= ?
                ORDER BY r.composite_risk_score DESC
                LIMIT ?
            '''
            cursor.execute(query, (category, min_risk, limit))
        else:
            query = '''
                SELECT s.scheme_id, s.title, s.category, s.tags, s.link,
                       r.accessibility_risk, r.bureaucratic_risk, 
                       r.market_distortion_risk, r.ecological_risk,
                       r.social_friction_risk, r.composite_risk_score
                FROM schemes s
                JOIN government_risk_analysis r ON s.scheme_id = r.scheme_id
                WHERE r.composite_risk_score >= ?
                ORDER BY r.composite_risk_score DESC
                LIMIT ?
            '''
            cursor.execute(query, (min_risk, limit))

        results = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return {
            "filter": {
                "category": category,
                "min_risk": min_risk,
                "limit": limit
            },
            "total_results": len(results),
            "risky_schemes": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/gov/risky-schemes/search")
def search_risky_schemes_by_tags(request: TagSearchRequest):
    """
    Search for risky schemes matching specific tags.
    Tags can be comma or space separated (e.g., "education, women", "agriculture rural").
    Results sorted by composite risk score (highest first).
    """
    if not request.tags.strip():
        raise HTTPException(status_code=400, detail="Tags cannot be empty.")

    try:
        from government_risk_analyzer import RiskAnalyzer
        analyzer = RiskAnalyzer()
        results = analyzer.search_risky_schemes_by_tags(request.tags, top_n=request.top_n)

        return {
            "tags": request.tags,
            "total_results": len(results),
            "risky_schemes": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/gov/risk-summary")
def get_risk_summary():
    """
    Aggregate risk statistics: average risk per category,
    total high/medium/low risk scheme counts, and overall stats.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Per-category breakdown
        cursor.execute('''
            SELECT s.category,
                   COUNT(*) as total_schemes,
                   ROUND(AVG(r.composite_risk_score), 2) as avg_risk,
                   ROUND(MAX(r.composite_risk_score), 2) as max_risk,
                   ROUND(MIN(r.composite_risk_score), 2) as min_risk,
                   SUM(CASE WHEN r.composite_risk_score >= 3.0 THEN 1 ELSE 0 END) as high_risk_count,
                   SUM(CASE WHEN r.composite_risk_score >= 2.0 AND r.composite_risk_score < 3.0 THEN 1 ELSE 0 END) as medium_risk_count,
                   SUM(CASE WHEN r.composite_risk_score < 2.0 THEN 1 ELSE 0 END) as low_risk_count
            FROM schemes s
            JOIN government_risk_analysis r ON s.scheme_id = r.scheme_id
            GROUP BY s.category
            ORDER BY avg_risk DESC
        ''')
        category_breakdown = [dict(row) for row in cursor.fetchall()]

        # Overall totals
        cursor.execute('''
            SELECT COUNT(*) as total_schemes,
                   ROUND(AVG(composite_risk_score), 2) as overall_avg_risk,
                   ROUND(MAX(composite_risk_score), 2) as overall_max_risk,
                   SUM(CASE WHEN composite_risk_score >= 3.0 THEN 1 ELSE 0 END) as total_high_risk,
                   SUM(CASE WHEN composite_risk_score >= 2.0 AND composite_risk_score < 3.0 THEN 1 ELSE 0 END) as total_medium_risk,
                   SUM(CASE WHEN composite_risk_score < 2.0 THEN 1 ELSE 0 END) as total_low_risk
            FROM government_risk_analysis
        ''')
        overall = dict(cursor.fetchone())
        conn.close()

        return {
            "overall": overall,
            "by_category": category_breakdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class CustomRiskRequest(BaseModel):
    prompt: str
    accessibility_weight: float = 0.2
    bureaucratic_weight: float = 0.2
    market_distortion_weight: float = 0.2
    ecological_weight: float = 0.2
    social_friction_weight: float = 0.2
    limit: Optional[int] = 5


@app.post("/api/gov/custom-risk")
def custom_risk_sandbox(request: CustomRiskRequest):
    """
    CUSTOM POLICY RISK SANDBOX (LangChain + Gemini Workflow)
    Analyzes schemes against natural language risk descriptions and custom risk parameter weights.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        
    try:
        import re
        from prompt_enhancer import GOOGLE_API_KEY
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser
        
        if not GOOGLE_API_KEY:
             raise HTTPException(
                 status_code=503,
                 detail="Gemini API key not configured."
             )
             
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.2,
            max_output_tokens=150,
        )
        
        tag_prompt_tmpl = ChatPromptTemplate.from_messages([
            ("system", "You are a policy analyst assistant. Extract 3-5 space-separated keyword tags from the user's custom risk concern to search government schemes. Return ONLY the space-separated words, nothing else."),
            ("human", "{concern}")
        ])
        
        tag_chain = tag_prompt_tmpl | llm | StrOutputParser()
        extracted_tags = tag_chain.invoke({"concern": request.prompt})
        extracted_tags = extracted_tags.strip().strip('"').strip("'")
        
        # Step 2: Query schemes from DB matching those extracted tags
        from government_risk_analyzer import RiskAnalyzer
        analyzer = RiskAnalyzer()
        matched_schemes = analyzer.search_risky_schemes_by_tags(extracted_tags, top_n=15)
        
        if not matched_schemes:
            # Fallback to general risky schemes
            matched_schemes = analyzer.search_risky_schemes_by_tags("subsidy grant training loan certificate", top_n=15)
            
        # Step 3: Use Gemini to analyze and rank the matched schemes against the custom risk criteria and weights
        analysis_prompt_tmpl = ChatPromptTemplate.from_messages([
            ("system", """You are a senior government auditor. You are reviewing the following scheme against a specific policy concern.
Concern: {concern}

Scheme Title: {title}
Scheme Description: {description}

Assign a risk score from 0.0 (No Risk) to 10.0 (Extremely High Risk) indicating how much this specific scheme triggers the policy concern.
Provide a 1-2 sentence justification.

Return format EXACTLY like this:
Score: [number]
Justification: [text]"""),
            ("human", "Audit this scheme.")
        ])
        
        analysis_chain = analysis_prompt_tmpl | llm | StrOutputParser()
        
        results = []
        for scheme in matched_schemes[:request.limit]:
            audit_output = analysis_chain.invoke({
                "concern": request.prompt,
                "title": scheme["title"],
                "description": scheme.get("description", "Government welfare benefits distribution.")
            })
            
            # Parse output
            score_match = re.search(r"Score:\s*([0-9.]+)", audit_output, re.IGNORECASE)
            just_match = re.search(r"Justification:\s*(.+)", audit_output, re.IGNORECASE)
            
            custom_score = float(score_match.group(1)) if score_match else 5.0
            justification = just_match.group(1) if just_match else "Scheme triggers custom concern criteria."
            
            # Calculate composite weighted risk based on the sliders
            w_acc = request.accessibility_weight * scheme.get("accessibility_risk", 1.0)
            w_bur = request.bureaucratic_weight * scheme.get("bureaucratic_risk", 1.0)
            w_mar = request.market_distortion_weight * scheme.get("market_distortion_risk", 1.0)
            w_eco = request.ecological_weight * scheme.get("ecological_risk", 1.0)
            w_soc = request.social_friction_weight * scheme.get("social_friction_risk", 1.0)
            
            weight_sum = (request.accessibility_weight + request.bureaucratic_weight + 
                          request.market_distortion_weight + request.ecological_weight + 
                          request.social_friction_weight)
            
            if weight_sum > 0:
                weighted_base = (w_acc + w_bur + w_mar + w_eco + w_soc) / weight_sum
            else:
                weighted_base = scheme.get("composite_risk_score", 3.0)
                
            # Combine composite base risk with the LLM custom risk evaluation
            final_composite_score = round((weighted_base * 0.4) + (custom_score * 0.6), 2)
            
            results.append({
                "scheme_id": scheme["scheme_id"],
                "title": scheme["title"],
                "category": scheme["category"],
                "tags": scheme["tags"],
                "link": scheme["link"],
                "accessibility_risk": scheme.get("accessibility_risk", 1.0),
                "bureaucratic_risk": scheme.get("bureaucratic_risk", 1.0),
                "market_distortion_risk": scheme.get("market_distortion_risk", 1.0),
                "ecological_risk": scheme.get("ecological_risk", 1.0),
                "social_friction_risk": scheme.get("social_friction_risk", 1.0),
                "custom_risk_score": custom_score,
                "weighted_base_score": round(weighted_base, 2),
                "final_composite_score": final_composite_score,
                "justification": justification
            })
            
        # Sort by final score descending
        results.sort(key=lambda x: x["final_composite_score"], reverse=True)
        
        return {
            "prompt": request.prompt,
            "extracted_tags": extracted_tags,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run using: uvicorn api:app --reload
