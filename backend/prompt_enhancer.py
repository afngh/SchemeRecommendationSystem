"""
SchemeLens Prompt Enhancer — Powered by Groq API (groq/compound-mini) + LangChain

This module enhances raw user queries before they hit the FAISS semantic search.
Takes a vague user prompt and produces a rich, keyword-dense search context
using ultra-fast Groq LLM inference.
"""

import os
import re
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    base_dir = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(base_dir, '..', '.env'))
    load_dotenv(os.path.join(base_dir, '.env'))
except ImportError:
    pass

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")


class PromptEnhancer:
    """
    Uses Groq API via LangChain to transform a raw user query into an
    optimized search context for FAISS semantic search over government schemes.
    """

    SCHEME_CATEGORIES = [
        "Agriculture", "Benefits Social", "Business Self Employed",
        "Driving Transport", "Education Learning", "Health Wellness",
        "Housing Local Services", "Jobs", "Justice Law Grievances",
        "Money Taxes", "Science It Communication", "Travel Tourism",
        "Welfare Of Families", "Youth Sports Culture"
    ]

    SYSTEM_PROMPT = """You are a search query optimizer for "SchemeLens", an Indian government scheme recommendation system.

Your job: Take the user's raw query and produce an ENHANCED SEARCH CONTEXT — a dense paragraph of relevant keywords and phrases that will be used for semantic vector search over a database of 4,500+ Indian government schemes.

The database contains schemes across these categories: {categories}

Each scheme has: Title, Category, Description, Tags (keywords like "Scholarship, Women, BPL, Financial Assistance").

RULES:
1. Extract the user's core INTENT (financial help, education, housing, health, etc.)
2. Identify the TARGET DEMOGRAPHIC (women, students, farmers, senior citizens, disabled, SC/ST/OBC, BPL, widows, etc.)
3. Map to the most relevant CATEGORIES from the list above
4. Expand with SYNONYMS and RELATED TERMS used in Indian government policy language
5. Include common SCHEME KEYWORDS (subsidy, grant, pension, scholarship, allowance, stipend, reimbursement, loan, insurance)
6. Output ONLY the enhanced search text — no explanations, no formatting, no bullet points
7. Keep it under 100 words — dense and keyword-rich
8. Use Indian English policy terminology (e.g., "BPL" for below poverty line, "SC/ST" for scheduled castes/tribes)

IMPORTANT: Output ONLY the enhanced search context as a single paragraph. Nothing else."""

    USER_PROMPT = "Enhance this query for semantic search: {query}"

    def __init__(self, api_key: str = None):
        key = api_key or os.environ.get("GROQ_API_KEY", "")
        if not key:
            raise ValueError(
                "GROQ_API_KEY not found. Set it as an environment variable or pass it directly."
            )

        # Initialize Groq via LangChain (groq/compound-mini model)
        self.llm = ChatGroq(
            model_name="groq/compound-mini",
            groq_api_key=key,
            temperature=0.3,
            max_tokens=250,
            max_retries=1,
        )

        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", self.SYSTEM_PROMPT),
            ("human", self.USER_PROMPT),
        ])

        self.chain = self.prompt_template | self.llm | StrOutputParser()

    def enhance(self, user_query: str) -> str:
        if not user_query.strip():
            return user_query

        try:
            raw_output = self.chain.invoke({
                "query": user_query,
                "categories": ", ".join(self.SCHEME_CATEGORIES),
            })

            cleaned = re.sub(r'<think>.*?</think>', '', raw_output, flags=re.DOTALL).strip()
            cleaned = cleaned.strip('"').strip("'")

            print(f"  [PromptEnhancer Groq] Original : {user_query}")
            print(f"  [PromptEnhancer Groq] Enhanced : {cleaned[:150]}...")
            return cleaned

        except Exception as e:
            print(f"  [PromptEnhancer Groq] Warning: LLM enhancement failed ({e}). Using original query.")
            return user_query


if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Testing Groq Prompt Enhancer")
    print("=" * 60)
    try:
        enhancer = PromptEnhancer()
        res = enhancer.enhance("I need help for my daughter education scholarship")
        print("Output:", res)
    except Exception as e:
        print("Setup Note:", e)
