"""
SchemeLens Prompt Enhancer — Powered by Gemini + LangChain

This module enhances raw user queries before they hit the FAISS semantic search.
A single LangChain chain takes a vague user prompt and produces a rich,
keyword-dense search context that dramatically improves recommendation quality.

Example:
    Input:  "I need help for my daughter's school fees"
    Output: "education scholarship financial assistance girl child student 
             school fees tuition fee reimbursement women empowerment 
             below poverty line BPL minority SC ST OBC Education Learning"
"""

import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
    load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed, rely on system env vars

# Load API key from environment
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")


class PromptEnhancer:
    """
    Uses Gemini via LangChain to transform a raw user query into an
    optimized search context for FAISS semantic search over government schemes.
    """

    # Available scheme categories in the database (for the LLM's context)
    SCHEME_CATEGORIES = [
        "Agriculture", "Benefits Social", "Business Self Employed",
        "Driving Transport", "Education Learning", "Health Wellness",
        "Housing Local Services", "Jobs", "Justice Law Grievances",
        "Money Taxes", "Science It Communication", "Travel Tourism",
        "Welfare Of Families", "Youth Sports Culture"
    ]

    # The system prompt that instructs Gemini how to enhance queries
    SYSTEM_PROMPT = """You are a search query optimizer for "SchemeLens", an Indian government scheme recommendation system.

Your job: Take the user's raw query and produce an ENHANCED SEARCH CONTEXT — a dense paragraph of relevant keywords and phrases that will be used for semantic vector search over a database of 4,500+ Indian government schemes.

The database contains schemes across these categories: {categories}

Each scheme has: Title, Category, Description, Tags (keywords like "Scholarship, Women, BPL, Financial Assistance").

RULES:
1. Extract the user's core INTENT (what they need: financial help, education, housing, health, etc.)
2. Identify the TARGET DEMOGRAPHIC (women, students, farmers, senior citizens, disabled, SC/ST/OBC, minorities, BPL, widows, etc.)
3. Map to the most relevant CATEGORIES from the list above
4. Expand with SYNONYMS and RELATED TERMS used in Indian government policy language
5. Include common SCHEME KEYWORDS (subsidy, grant, pension, scholarship, allowance, stipend, reimbursement, training, skill development, loan, insurance, etc.)
6. Output ONLY the enhanced search text — no explanations, no formatting, no bullet points
7. Keep it under 100 words — dense and keyword-rich
8. Use Indian English policy terminology (e.g., "BPL" for below poverty line, "SC/ST" for scheduled castes/tribes)

IMPORTANT: Output ONLY the enhanced search context as a single paragraph. Nothing else."""

    USER_PROMPT = "Enhance this query for semantic search: {query}"

    def __init__(self, api_key: str = None):
        """
        Initialize the Prompt Enhancer with a Gemini LLM.
        
        Args:
            api_key: Google API key. Falls back to GOOGLE_API_KEY env var.
        """
        key = api_key or GOOGLE_API_KEY
        if not key:
            raise ValueError(
                "GOOGLE_API_KEY not found. Set it as an environment variable "
                "or pass it directly: PromptEnhancer(api_key='your-key')"
            )

        # Initialize Gemini via LangChain
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=key,
            temperature=0.3,  # Low temperature for consistent, focused output
            max_output_tokens=200,
        )

        # Build the single LangChain chain
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", self.SYSTEM_PROMPT),
            ("human", self.USER_PROMPT),
        ])

        # Chain: Prompt → LLM → Parse string output
        self.chain = self.prompt_template | self.llm | StrOutputParser()

    def enhance(self, user_query: str) -> str:
        """
        Enhance a raw user query into an optimized search context.
        
        Args:
            user_query: The raw natural language query from the user.
            
        Returns:
            Enhanced search context string for semantic search.
        """
        if not user_query.strip():
            return user_query

        try:
            enhanced = self.chain.invoke({
                "query": user_query,
                "categories": ", ".join(self.SCHEME_CATEGORIES),
            })

            # Clean up the output
            enhanced = enhanced.strip().strip('"').strip("'")

            print(f"  [PromptEnhancer] Original : {user_query}")
            print(f"  [PromptEnhancer] Enhanced : {enhanced[:150]}...")

            return enhanced

        except Exception as e:
            # If the LLM fails for any reason, gracefully fall back to original query
            print(f"  [PromptEnhancer] Warning: LLM enhancement failed ({e}). Using original query.")
            return user_query


# Quick test when run directly
if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Testing Prompt Enhancer")
    print("=" * 60)

    enhancer = PromptEnhancer()

    test_queries = [
        "I need help for my daughter's school fees",
        "I am a farmer and need money for irrigation",
        "My mother is a widow and needs pension",
        "I want to start a small business in my village",
        "health insurance for senior citizens",
    ]

    for q in test_queries:
        print(f"\n{'─' * 60}")
        print(f"  Input : {q}")
        result = enhancer.enhance(q)
        print(f"  Output: {result}")
