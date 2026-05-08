import time
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def scrape_india_gov_schemes(category_id, category_name, max_pages=3):
    """
    Scrapes scheme data from india.gov.in using Selenium to handle dynamic rendering.
    Returns a pandas DataFrame.
    """
    scraped_data = []
    
    # Set up Selenium Chrome options for headless mode
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    print("Initializing WebDriver...")
    try:
        driver = webdriver.Chrome(options=chrome_options)
    except Exception as e:
        print(f"Failed to initialize WebDriver: {e}")
        print("Please ensure you have Chrome and ChromeDriver installed, or 'webdriver-manager'.")
        return pd.DataFrame()

    try:
        # Iterate over the requested number of pages
        for page in range(1, max_pages + 1):
            print(f"Fetching page {page}...")
            
            # The URL with parameters
            url = f"https://www.india.gov.in/my-government/schemes/search?schemeCategory={category_id}&schemeCategoryName={category_name}&pagenumber={page}"
            
            driver.get(url)
            
            # Wait for h2 elements to load (indicating content has been rendered)
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "h2"))
                )
            except Exception as e:
                print(f"Timeout waiting for page {page} to load or no schemes found: {e}")
                continue
                
            # Allow a brief moment for any final dynamic content changes
            time.sleep(2)
            
            # Get the fully rendered HTML and pass to BeautifulSoup
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Find all h2 tags, which represent the scheme titles based on the provided HTML structure
            h2_tags = soup.find_all('h2')
            
            for h2 in h2_tags:
                a_tag = h2.find('a')
                if not a_tag:
                    continue
                    
                title = a_tag.text.strip()
                # If the title is empty, skip it
                if not title:
                    continue
                    
                link = a_tag.get('href', '')
                if link and not link.startswith('http'):
                    # Handle relative URLs
                    link = "https://www.india.gov.in" + link
                    
                # Variables to store description and tags
                description = ""
                tags = []
                
                # Search for the next 'p' and 'ul' tags for the current scheme.
                # We stop searching if we encounter the next 'h2' to avoid grabbing data from the next scheme.
                p_tag = None
                ul_tag = None
                
                for elem in h2.find_all_next(['p', 'ul', 'h2']):
                    if elem.name == 'h2':
                        break # Reached the next scheme item
                    if elem.name == 'p' and not p_tag:
                        p_tag = elem
                    if elem.name == 'ul' and not ul_tag:
                        ul_tag = elem
                        
                    # If we found both, no need to keep searching
                    if p_tag and ul_tag:
                        break
                        
                if p_tag:
                    description = p_tag.text.strip()
                    
                if ul_tag:
                    # Extract text from all list items within the ul
                    li_tags = ul_tag.find_all('li')
                    tags = [li.text.strip() for li in li_tags if li.text.strip()]
                
                # Append the structured data
                scraped_data.append({
                    'Title': title,
                    'Link': link,
                    'Description': description,
                    'Tags': ", ".join(tags)
                })
    finally:
        driver.quit()

    # Convert the list of dictionaries to a Pandas DataFrame
    df = pd.DataFrame(scraped_data)
    
    return df

if __name__ == "__main__":
    print("Starting the web scraper...")
    
    # Configuration for the new category: Jobs
    category_id = '2'
    category_name = 'Jobs'
    num_pages_to_scrape = 45
    csv_filename = "jobs_schemes.csv"
    
    df_schemes = scrape_india_gov_schemes(category_id, category_name, max_pages=num_pages_to_scrape)
    
    # Check if data was collected
    if not df_schemes.empty:
        # Save the DataFrame to a CSV file
        df_schemes.to_csv(csv_filename, index=False, encoding='utf-8')
        
        print(f"\nSuccessfully scraped {len(df_schemes)} schemes.")
        print(f"Data saved to {csv_filename}\n")
        
        print("First few rows of the scraped data:")
        print(df_schemes.head())
    else:
        print("No data was scraped. Please check the website structure or your network connection.")
