import sqlite3
import re
import pandas as pd
import os

# Configuration
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'schemelens.db')

class RiskAnalyzer:
    def __init__(self):
        # We define our NLP Keywords for the algorithms here
        self.doc_keywords = ['certificate', 'card', 'proof', 'affidavit', 'report', 'document', 'license', 'attested', 'receipt']
        self.online_keywords = ['online portal', 'upload', 'website', 'digital', 'app', 'online application']
        
        self.dept_keywords = ['department', 'committee', 'officer', 'panchayat', 'collector', 'ministry', 'authority', 'inspector', 'commission', 'board']
        self.delay_keywords = ['inspection', 'verification', 'audit', 'approval', 'scrutiny', 'clearance']
        
        self.handout_keywords = ['free', 'subsidy', 'financial assistance', 'cash', 'grant', 'allowance', 'waiver', 'compensation']
        self.empowerment_keywords = ['training', 'skill', 'education', 'loan', 'entrepreneur', 'employment', 'business', 'startup', 'course']
        
        self.eco_threat_keywords = ['fertilizer', 'borewell', 'diesel', 'tractor', 'pesticide', 'groundwater', 'chemical', 'mining', 'factory']
        
        self.demo_filters = ['caste', 'tribe', 'religion', 'minority', 'women', 'urban', 'rural', 'disabled', 'widow', 'bpl', 'below poverty line']

    def _get_db_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _count_matches(self, text, keywords):
        """Helper function to count how many keywords from a list appear in the text"""
        text = text.lower()
        count = sum(1 for kw in keywords if re.search(r'\b' + kw + r'\b', text))
        return count

    def algo_accessibility_risk(self, description):
        """Algorithm 1: Accessibility / Exclusion Risk"""
        doc_count = self._count_matches(description, self.doc_keywords)
        online_penalty = 3 if self._count_matches(description, self.online_keywords) > 0 else 0
        
        score = (doc_count * 0.5) + online_penalty
        return min(round(score, 1), 10.0)

    def algo_bureaucratic_risk(self, description):
        """Algorithm 2: Bureaucratic Friction (Red Tape)"""
        dept_count = self._count_matches(description, self.dept_keywords)
        delay_penalty = 2 if self._count_matches(description, self.delay_keywords) > 0 else 0
        
        score = (dept_count * 1.5) + delay_penalty
        return min(round(score, 1), 10.0)

    def algo_market_distortion_risk(self, description, tags):
        """Algorithm 3: Market Distortion / Dependency Risk"""
        full_text = description + " " + tags
        handout_count = self._count_matches(full_text, self.handout_keywords)
        empower_count = self._count_matches(full_text, self.empowerment_keywords)
        
        if handout_count > empower_count:
            if handout_count > (empower_count * 2) and "monthly" in full_text.lower():
                return 9.0
            return 7.0
        elif empower_count >= handout_count and empower_count > 0:
            return 2.0
        return 4.0 # Neutral

    def algo_ecological_risk(self, category, description, tags):
        """Algorithm 4: Ecological / Environmental Risk"""
        if category.lower() not in ["agriculture", "industry"]:
            return 1.0 # Low risk for non-heavy categories
            
        full_text = description + " " + tags
        eco_threats = self._count_matches(full_text, self.eco_threat_keywords)
        
        score = eco_threats * 2.5
        return min(max(score, 1.0), 10.0) # Base risk 1.0, max 10.0

    def algo_social_friction_risk(self, description, tags):
        """Algorithm 5: Social Friction Risk"""
        full_text = description + " " + tags
        filter_count = self._count_matches(full_text, self.demo_filters)
        
        score = filter_count * 2.0
        return min(round(score, 1), 10.0)

    def run_analysis(self):
        print("Starting Government Risk Analysis Engine...")
        conn = self._get_db_connection()
        
        # 1. Setup the new Government Risk database table
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS government_risk_analysis (
            scheme_id TEXT PRIMARY KEY,
            accessibility_risk REAL,
            bureaucratic_risk REAL,
            market_distortion_risk REAL,
            ecological_risk REAL,
            social_friction_risk REAL,
            composite_risk_score REAL,
            FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id)
        )
        ''')
        cursor.execute('DELETE FROM government_risk_analysis') # Clear old analysis
        
        # 2. Fetch all schemes
        df = pd.read_sql_query("SELECT * FROM schemes", conn)
        
        if df.empty:
            print("No schemes found. Run setup_database.py first.")
            return

        print(f"Analyzing {len(df)} schemes using the 5 NLP algorithms...")
        
        risk_data = []
        for _, row in df.iterrows():
            desc = str(row['description'])
            tags = str(row['tags'])
            category = str(row['category'])
            
            # Run Algorithms
            r1 = self.algo_accessibility_risk(desc)
            r2 = self.algo_bureaucratic_risk(desc)
            r3 = self.algo_market_distortion_risk(desc, tags)
            r4 = self.algo_ecological_risk(category, desc, tags)
            r5 = self.algo_social_friction_risk(desc, tags)
            
            # Composite Score (Average)
            composite = round((r1 + r2 + r3 + r4 + r5) / 5.0, 2)
            
            risk_data.append((
                row['scheme_id'], r1, r2, r3, r4, r5, composite
            ))
            
        # 3. Insert scores into the database
        cursor.executemany('''
        INSERT INTO government_risk_analysis 
        (scheme_id, accessibility_risk, bureaucratic_risk, market_distortion_risk, ecological_risk, social_friction_risk, composite_risk_score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', risk_data)
        
        conn.commit()
        conn.close()
        
        print("Risk Analysis Complete! All scores saved to the database.")
        
        # Print a quick preview of the top 3 most dangerous schemes
        self._print_top_risks(df, risk_data)

    def _print_top_risks(self, df, risk_data):
        print("\n" + "="*60)
        print("⚠️ TOP 3 MOST DANGEROUS SCHEMES (HIGHEST COMPOSITE RISK) ⚠️")
        print("="*60)
        
        # Sort by composite score descending
        risk_data.sort(key=lambda x: x[6], reverse=True)
        top_3 = risk_data[:3]
        
        # Create a lookup dictionary for fast access
        scheme_dict = df.set_index('scheme_id').to_dict('index')
        
        for i, data in enumerate(top_3, 1):
            sid, r1, r2, r3, r4, r5, comp = data
            scheme = scheme_dict[sid]
            print(f"\n{i}. {scheme['title']}")
            print(f"   Category: {scheme['category']}")
            print(f"   🔥 Composite Risk Score: {comp}/10.0")
            print(f"      - Accessibility Risk: {r1}")
            print(f"      - Bureaucratic Risk: {r2}")
            print(f"      - Market Distortion: {r3}")
            print(f"      - Ecological Risk:   {r4}")
            print(f"      - Social Friction:   {r5}")

    # ================================================================
    # TAG-BASED RISK SEARCH FEATURE
    # ================================================================

    def search_risky_schemes_by_tags(self, tag_input, top_n=10):
        """
        Search for risky schemes that match the given tags.
        
        Args:
            tag_input (str): Comma or space separated tags.
                             Example: "education women", "agriculture, rural, subsidy"
            top_n (int): Number of top results to return.
            
        Returns:
            list[dict]: List of matching schemes with their risk scores,
                        sorted by composite risk score (highest first).
        """
        # Parse the input tags — split by comma first, then by spaces
        raw_tags = re.split(r'[,]+', tag_input)
        search_tags = []
        for chunk in raw_tags:
            for word in chunk.strip().split():
                cleaned = word.strip().lower()
                if cleaned:
                    search_tags.append(cleaned)

        if not search_tags:
            print("No valid tags provided.")
            return []

        conn = self._get_db_connection()
        
        # Join schemes with their risk scores
        query = '''
            SELECT s.scheme_id, s.title, s.category, s.description, s.tags, s.link,
                   r.accessibility_risk, r.bureaucratic_risk, r.market_distortion_risk,
                   r.ecological_risk, r.social_friction_risk, r.composite_risk_score
            FROM schemes s
            INNER JOIN government_risk_analysis r ON s.scheme_id = r.scheme_id
        '''
        df = pd.read_sql_query(query, conn)
        conn.close()

        if df.empty:
            print("No risk data found. Run the full analysis first (Option 1).")
            return []

        # Score each scheme by how many of the search tags it matches
        # We search across title + tags + description + category
        def compute_tag_relevance(row):
            searchable = (
                str(row['title']).lower() + " " +
                str(row['tags']).lower() + " " +
                str(row['description']).lower() + " " +
                str(row['category']).lower()
            )
            matches = sum(1 for tag in search_tags if tag in searchable)
            return matches

        df['tag_relevance'] = df.apply(compute_tag_relevance, axis=1)

        # Filter: only keep schemes that match at least one tag
        df = df[df['tag_relevance'] > 0]

        if df.empty:
            print(f"No schemes found matching tags: {search_tags}")
            return []

        # Sort by composite risk (descending), then by tag relevance (descending)
        df = df.sort_values(
            by=['composite_risk_score', 'tag_relevance'],
            ascending=[False, False]
        ).head(top_n)

        results = df.to_dict('records')
        return results

    def _display_tag_results(self, results, search_tags):
        """Pretty-print the tag-based search results."""
        print("\n" + "=" * 70)
        print(f"🔍 RISKY SCHEMES FOR TAGS: {', '.join(search_tags).upper()}")
        print(f"   Found {len(results)} matching scheme(s)")
        print("=" * 70)

        for i, r in enumerate(results, 1):
            # Risk level indicator
            score = r['composite_risk_score']
            if score >= 3.0:
                level = "🔴 HIGH"
            elif score >= 2.0:
                level = "🟡 MEDIUM"
            else:
                level = "🟢 LOW"

            print(f"\n{'─' * 70}")
            print(f"  {i}. {r['title']}")
            print(f"     Category : {r['category']}")
            print(f"     Tags     : {r['tags']}")
            print(f"     Risk     : {level} — Composite Score: {score}/10.0")
            print(f"     ├── Accessibility Risk    : {r['accessibility_risk']}")
            print(f"     ├── Bureaucratic Risk      : {r['bureaucratic_risk']}")
            print(f"     ├── Market Distortion Risk : {r['market_distortion_risk']}")
            print(f"     ├── Ecological Risk        : {r['ecological_risk']}")
            print(f"     └── Social Friction Risk   : {r['social_friction_risk']}")
            
            # Show a snippet of the description (first 150 chars)
            desc = str(r['description'])
            snippet = desc[:150] + "..." if len(desc) > 150 else desc
            print(f"     📝 {snippet}")
            print(f"     🔗 {r['link']}")

    def interactive_tag_search(self):
        """Interactive CLI loop for searching risky schemes by tags."""
        print("\n" + "=" * 70)
        print("🏛️  GOVERNMENT POLICY RISK ENGINE — TAG-BASED SEARCH")
        print("=" * 70)
        print("Search for risky schemes/policies by entering tags.")
        print("Examples:")
        print("  → education, women")
        print("  → agriculture rural subsidy")
        print("  → health wellness senior citizen")
        print("  → scholarship minority students")
        print("  → housing urban disabled")
        print("\nType 'quit' or 'exit' to return to the main menu.\n")

        while True:
            tag_input = input("🔎 Enter tags: ").strip()
            
            if tag_input.lower() in ['quit', 'exit', 'q']:
                print("Returning to main menu...\n")
                break

            if not tag_input:
                print("⚠️  Please enter at least one tag.\n")
                continue

            # Parse tags for display
            raw_tags = re.split(r'[,]+', tag_input)
            display_tags = []
            for chunk in raw_tags:
                for word in chunk.strip().split():
                    cleaned = word.strip().lower()
                    if cleaned:
                        display_tags.append(cleaned)

            results = self.search_risky_schemes_by_tags(tag_input, top_n=10)

            if results:
                self._display_tag_results(results, display_tags)
            
            print()  # Spacing before next prompt


if __name__ == "__main__":
    analyzer = RiskAnalyzer()

    print("\n" + "=" * 70)
    print("🏛️  SchemeLens — Government Policy Risk Analysis Engine")
    print("=" * 70)
    print("  1. Run Full Risk Analysis  (analyze all schemes)")
    print("  2. Search Risky Schemes by Tags  (e.g., education women)")
    print("  3. Exit")
    print("=" * 70)

    choice = input("\nSelect an option (1/2/3): ").strip()

    if choice == '1':
        analyzer.run_analysis()
    elif choice == '2':
        analyzer.interactive_tag_search()
    elif choice == '3':
        print("Goodbye!")
    else:
        print("Invalid option. Exiting.")
