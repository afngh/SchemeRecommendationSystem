import sqlite3
import pandas as pd
import numpy as np
import os
import pickle
from sentence_transformers import SentenceTransformer
import faiss

# Prompt Enhancer (Gemini + LangChain)
try:
    from prompt_enhancer import PromptEnhancer
    ENHANCER_AVAILABLE = True
except ImportError:
    ENHANCER_AVAILABLE = False

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', 'data', 'schemelens.db')
FAISS_INDEX_PATH = os.path.join(BASE_DIR, '..', 'data', 'scheme_index.faiss')
ID_MAPPING_PATH = os.path.join(BASE_DIR, '..', 'data', 'scheme_id_mapping.pkl')
# Using a fast, lightweight, and highly accurate embedding model
MODEL_NAME = 'all-MiniLM-L6-v2' 

class AIEngine:
    def __init__(self):
        print(f"Loading NLP model '{MODEL_NAME}'... (This might take a moment the first time)")
        self.model = SentenceTransformer(MODEL_NAME)
        self.index = None
        self.id_mapping = None

        # Initialize the Gemini Prompt Enhancer
        self.enhancer = None
        if ENHANCER_AVAILABLE:
            try:
                self.enhancer = PromptEnhancer()
                print("✅ Gemini Prompt Enhancer loaded successfully.")
            except Exception as e:
                print(f"⚠️  Prompt Enhancer not available ({e}). Using raw queries.")
                self.enhancer = None

    def _get_db_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def build_vector_db(self):
        """
        Reads all schemes from the database, generates AI embeddings, 
        and builds the FAISS vector database.
        """
        print("Fetching schemes from the database...")
        conn = self._get_db_connection()
        df = pd.read_sql_query("SELECT scheme_id, title, category, description, tags FROM schemes", conn)
        conn.close()

        if df.empty:
            print("No schemes found in the database. Please run setup_database.py first.")
            return

        print(f"Generating AI embeddings for {len(df)} schemes. This will take a few minutes...")
        
        # We combine Title, Category, Description, and Tags to give the AI maximum context
        # Fill missing values with empty strings to avoid errors
        df.fillna("", inplace=True)
        text_data = df['title'] + " " + df['category'] + " " + df['description'] + " " + df['tags']
        sentences = text_data.tolist()

        # Generate embeddings (this converts the text into mathematical vectors)
        embeddings = self.model.encode(sentences, show_progress_bar=True)
        
        # Initialize FAISS Index
        # The all-MiniLM-L6-v2 model outputs vectors of size 384
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        
        # Add the vectors to the FAISS index
        self.index.add(np.array(embeddings).astype('float32'))
        
        # Save the mapping of FAISS row IDs to our actual Scheme_IDs
        self.id_mapping = {i: row['scheme_id'] for i, row in df.iterrows()}
        
        # Save everything to disk so we don't have to recompute this every time
        print("Saving the Vector Database to disk...")
        faiss.write_index(self.index, FAISS_INDEX_PATH)
        with open(ID_MAPPING_PATH, 'wb') as f:
            pickle.dump(self.id_mapping, f)
            
        print("Vector Database built and saved successfully!")

    def load_vector_db(self):
        """
        Loads the pre-built FAISS index and ID mapping from disk.
        """
        if not os.path.exists(FAISS_INDEX_PATH) or not os.path.exists(ID_MAPPING_PATH):
            print("Vector database not found. Building it now...")
            self.build_vector_db()
        else:
            self.index = faiss.read_index(FAISS_INDEX_PATH)
            with open(ID_MAPPING_PATH, 'rb') as f:
                self.id_mapping = pickle.load(f)

    def recommend_schemes(self, user_query, top_k=5, enhanced_query=None):
        """
        Takes a natural language query from a user and returns the top matching schemes.
        Uses Gemini LLM to enhance the query before semantic search for better results.
        
        Args:
            user_query: The raw user query.
            top_k: Number of results to return.
            enhanced_query: Pre-enhanced query from the API layer (avoids double enhancement).
        """
        if self.index is None or self.id_mapping is None:
            self.load_vector_db()

        print(f"\nAnalyzing user query: '{user_query}'...")

        # --- PROMPT ENHANCEMENT STEP ---
        # Use pre-enhanced query if provided, otherwise enhance here
        if enhanced_query:
            search_query = enhanced_query
        elif self.enhancer:
            search_query = self.enhancer.enhance(user_query)
        else:
            search_query = user_query

        # Convert the (enhanced) query into a vector for semantic search
        query_vector = self.model.encode([search_query])
        
        # Search the FAISS index for the closest matching scheme vectors
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), top_k)
        
        # Retrieve the matched Scheme IDs
        matched_scheme_ids = [self.id_mapping[idx] for idx in indices[0] if idx != -1]
        
        if not matched_scheme_ids:
            return []

        # Fetch the full details of these matched schemes from the SQLite database
        conn = self._get_db_connection()
        placeholders = ','.join('?' * len(matched_scheme_ids))
        query = f"SELECT * FROM schemes WHERE scheme_id IN ({placeholders})"
        
        cursor = conn.cursor()
        cursor.execute(query, matched_scheme_ids)
        results = cursor.fetchall()
        conn.close()
        
        # The database might not return them in the exact order of relevance,
        # so we re-sort them based on the FAISS ranking order
        result_dict = {row['scheme_id']: dict(row) for row in results}
        ordered_results = [result_dict[sid] for sid in matched_scheme_ids if sid in result_dict]
        
        return ordered_results

if __name__ == "__main__":
    # Test the AI Engine
    engine = AIEngine()
    
    # Check if we need to build the DB
    if not os.path.exists(FAISS_INDEX_PATH):
        engine.build_vector_db()
        
    # Let's run a test query
    test_query = "I am a single mother looking for financial assistance for my daughter's education"
    recommendations = engine.recommend_schemes(test_query)
    
    print("\n" + "="*50)
    print("TOP RECOMMENDATIONS FOUND BY AI:")
    print("="*50)
    
    for i, scheme in enumerate(recommendations, 1):
        print(f"\n{i}. {scheme['title']}")
        print(f"Category: {scheme['category']}")
        print(f"Link: {scheme['link']}")
        print(f"Description: {scheme['description'][:150]}...")
