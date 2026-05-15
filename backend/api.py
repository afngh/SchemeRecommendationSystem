from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import Optional

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

# Run using: uvicorn api:app --reload
