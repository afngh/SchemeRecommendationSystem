import sqlite3
import pandas as pd
import numpy as np
import os
import pickle
from sentence_transformers import SentenceTransformer

# Try importing FAISS; fall back to NumPy vector search if blocked by Windows Application Control or DLL errors
try:
    import faiss
    FAISS_AVAILABLE = True
except Exception as e:
    FAISS_AVAILABLE = False
    print(f"[Notice] FAISS unavailable ({e}). Using native NumPy vector search.")

# Prompt Enhancer (Gemini + LangChain)
try:
    from prompt_enhancer import PromptEnhancer
    ENHANCER_AVAILABLE = True
except ImportError:
    ENHANCER_AVAILABLE = False

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(BASE_DIR, 'data')):
    DATA_DIR = os.path.join(BASE_DIR, 'data')
else:
    DATA_DIR = os.path.join(BASE_DIR, '..', 'data')

DB_PATH = os.path.join(DATA_DIR, 'schemelens.db')
FAISS_INDEX_PATH = os.path.join(DATA_DIR, 'scheme_index.faiss')
NUMPY_EMBEDDINGS_PATH = os.path.join(DATA_DIR, 'scheme_embeddings.npy')
ID_MAPPING_PATH = os.path.join(DATA_DIR, 'scheme_id_mapping.pkl')
# Using a fast, lightweight, and highly accurate embedding model
MODEL_NAME = 'all-MiniLM-L6-v2' 

class AIEngine:
    def __init__(self):
        print(f"Loading NLP model '{MODEL_NAME}'... (This might take a moment the first time)")
        self.model = SentenceTransformer(MODEL_NAME)
        self.index = None
        self.embeddings = None
        self.id_mapping = None

        # Initialize the Groq Prompt Enhancer
        self.enhancer = None
        if ENHANCER_AVAILABLE:
            try:
                self.enhancer = PromptEnhancer()
                print("[OK] Groq API Prompt Enhancer loaded successfully.")
            except Exception as e:
                print(f"[Warning] Groq Prompt Enhancer not available ({e}). Using raw queries.")
                self.enhancer = None

    def _get_db_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def build_vector_db(self):
        """
        Reads all schemes from the database, generates AI embeddings, 
        and builds the vector database (FAISS index or NumPy matrix).
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
        float_embeddings = np.array(embeddings).astype('float32')
        self.embeddings = float_embeddings
        
        # Always save NumPy embeddings array
        np.save(NUMPY_EMBEDDINGS_PATH, float_embeddings)

        # Initialize FAISS Index if FAISS is available
        if FAISS_AVAILABLE:
            dimension = float_embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
            self.index.add(float_embeddings)
            try:
                faiss.write_index(self.index, FAISS_INDEX_PATH)
            except Exception as e:
                print(f"[Warning] Could not save FAISS index file: {e}")
        
        # Save the mapping of row IDs to our actual Scheme_IDs
        self.id_mapping = {i: row['scheme_id'] for i, row in df.iterrows()}
        
        print("Saving the Vector Database to disk...")
        with open(ID_MAPPING_PATH, 'wb') as f:
            pickle.dump(self.id_mapping, f)
            
        print("Vector Database built and saved successfully!")

    def load_vector_db(self):
        """
        Loads the pre-built index / embeddings and ID mapping from disk.
        """
        has_faiss_file = os.path.exists(FAISS_INDEX_PATH)
        has_npy_file = os.path.exists(NUMPY_EMBEDDINGS_PATH)
        has_mapping = os.path.exists(ID_MAPPING_PATH)

        if (not has_faiss_file and not has_npy_file) or not has_mapping:
            print("Vector database not found. Building it now...")
            self.build_vector_db()
            return

        # Load ID mapping
        with open(ID_MAPPING_PATH, 'rb') as f:
            self.id_mapping = pickle.load(f)

        # Load FAISS index if available, else load NumPy embeddings
        if FAISS_AVAILABLE and has_faiss_file:
            try:
                self.index = faiss.read_index(FAISS_INDEX_PATH)
            except Exception as e:
                print(f"[Warning] Failed loading FAISS index: {e}. Falling back to NumPy.")
                self.index = None

        if os.path.exists(NUMPY_EMBEDDINGS_PATH):
            self.embeddings = np.load(NUMPY_EMBEDDINGS_PATH)
        elif self.index is not None and hasattr(self.index, 'reconstruct_n'):
            # Reconstruct embeddings from FAISS index if npy doesn't exist
            self.embeddings = np.array([self.index.reconstruct(i) for i in range(self.index.ntotal)])

        if self.index is None and self.embeddings is None:
            print("Rebuilding vector database...")
            self.build_vector_db()

    def recommend_schemes(self, user_query, top_k=5, enhanced_query=None):
        """
        Takes a natural language query from a user and returns the top matching schemes.
        Uses Gemini LLM to enhance the query before semantic search for better results.
        
        Args:
            user_query: The raw user query.
            top_k: Number of results to return.
            enhanced_query: Pre-enhanced query from the API layer (avoids double enhancement).
        """
        if (self.index is None and self.embeddings is None) or self.id_mapping is None:
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
        query_vector = self.model.encode([search_query]).astype('float32')

        if FAISS_AVAILABLE and self.index is not None:
            distances, indices = self.index.search(query_vector, top_k)
        elif self.embeddings is not None:
            # NumPy vector search using L2 distance squared
            diffs = self.embeddings - query_vector
            dists = np.sum(diffs ** 2, axis=1)
            sorted_indices = np.argsort(dists)[:top_k]
            distances = np.array([dists[sorted_indices]])
            indices = np.array([sorted_indices])
        else:
            return []
        
        # Retrieve the matched Scheme IDs & map distances
        matched_scheme_ids = []
        score_map = {}
        for pos, idx in enumerate(indices[0]):
            if idx == -1:
                continue
            idx_int = int(idx)
            sid = None
            if idx_int in self.id_mapping:
                sid = self.id_mapping[idx_int]
            elif str(idx_int) in self.id_mapping:
                sid = self.id_mapping[str(idx_int)]
            elif idx in self.id_mapping:
                sid = self.id_mapping[idx]
            
            if sid and sid not in score_map:
                matched_scheme_ids.append(sid)
                score_map[sid] = float(distances[0][pos])
        
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
        # so we re-sort them based on the FAISS ranking order and attach similarity score
        result_dict = {row['scheme_id']: dict(row) for row in results}
        ordered_results = []
        for sid in matched_scheme_ids:
            if sid in result_dict:
                item = result_dict[sid]
                item['score'] = score_map.get(sid, 0.5)
                ordered_results.append(item)
        
        return ordered_results

if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    # Test the AI Engine
    engine = AIEngine()
    
    # Check if we need to build the DB
    if not os.path.exists(FAISS_INDEX_PATH) and not os.path.exists(NUMPY_EMBEDDINGS_PATH):
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
        safe_desc = scheme['description'][:150].encode('ascii', 'ignore').decode('ascii')
        print(f"Description: {safe_desc}...")


