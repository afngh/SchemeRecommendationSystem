import os
import pandas as pd
import sqlite3
import uuid

# Configuration
SCHEMES_DIR = "schemes"
MASTER_CSV_PATH = "all_schemes_master.csv"
DB_PATH = "schemelens.db"

def merge_and_clean_csvs():
    print("Gathering and merging all category CSVs...")
    all_dataframes = []
    
    # Check if the schemes directory exists
    if not os.path.exists(SCHEMES_DIR):
        print(f"Directory '{SCHEMES_DIR}' not found. Please ensure your CSV files are inside this directory.")
        return None
        
    for filename in os.listdir(SCHEMES_DIR):
        if filename.endswith(".csv") and filename != MASTER_CSV_PATH:
            file_path = os.path.join(SCHEMES_DIR, filename)
            try:
                # Read each CSV
                df = pd.read_csv(file_path)
                
                # Add a column for the category based on the filename
                category_name = filename.replace("_schemes.csv", "").replace("_", " ").title()
                df['Category'] = category_name
                
                all_dataframes.append(df)
                print(f"Loaded {len(df)} schemes from {filename}")
            except Exception as e:
                print(f"Error reading {filename}: {e}")
                
    if not all_dataframes:
        print("No CSV files found to merge.")
        return None
        
    # Combine all dataframes
    master_df = pd.concat(all_dataframes, ignore_index=True)
    
    # Clean the data
    print(f"\nInitial total schemes: {len(master_df)}")
    
    # 1. Drop duplicates based on the 'Link' or 'Title'
    master_df.drop_duplicates(subset=['Link'], inplace=True)
    print(f"Schemes after dropping duplicates: {len(master_df)}")
    
    # 2. Handle missing data (fill NaN with empty strings)
    master_df.fillna("", inplace=True)
    
    # 3. Assign a unique ID to each scheme
    # Using a short UUID for easy reference
    master_df['Scheme_ID'] = [str(uuid.uuid4())[:8] for _ in range(len(master_df))]
    
    # Rearrange columns for better readability
    columns = ['Scheme_ID', 'Title', 'Category', 'Description', 'Tags', 'Link']
    # Ensure all expected columns exist before reordering
    existing_columns = [col for col in columns if col in master_df.columns]
    master_df = master_df[existing_columns]
    
    # Save the master CSV
    master_df.to_csv(MASTER_CSV_PATH, index=False, encoding='utf-8')
    print(f"Successfully saved master dataset to {MASTER_CSV_PATH}\n")
    
    return master_df

def setup_database(df):
    print(f"Setting up SQLite database: {DB_PATH}...")
    
    # Connect to SQLite database (this will create the file if it doesn't exist)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create the schemes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS schemes (
        scheme_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        description TEXT,
        tags TEXT,
        link TEXT
    )
    ''')
    
    # Create the feedback/ratings table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_id TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        user_feedback TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id)
    )
    ''')
    
    # Clear existing schemes data so we don't have duplicates if run multiple times
    cursor.execute('DELETE FROM schemes')
    
    # Insert the cleaned schemes data into the database
    # We convert the dataframe to a list of tuples
    schemes_data = [
        (
            row['Scheme_ID'],
            row['Title'],
            row['Category'],
            row['Description'],
            row['Tags'],
            row['Link']
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany('''
    INSERT INTO schemes (scheme_id, title, category, description, tags, link)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', schemes_data)
    
    conn.commit()
    print(f"Successfully inserted {len(schemes_data)} schemes into the database.")
    
    # Let's insert a dummy feedback record just to test the structure
    cursor.execute('''
    INSERT INTO feedback (scheme_id, rating, user_feedback)
    VALUES (?, ?, ?)
    ''', (schemes_data[0][0], 5, "This scheme was very helpful and the recommendations were accurate!"))
    conn.commit()
    print("Added a dummy feedback record for testing.")
    
    conn.close()
    print("Database setup complete!")

if __name__ == "__main__":
    master_df = merge_and_clean_csvs()
    if master_df is not None:
        setup_database(master_df)
