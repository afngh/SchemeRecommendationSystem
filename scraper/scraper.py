import time
import os
import shutil
from datetime import datetime
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def create_backup(filename):
    # If the file already exists, let's keep a safe copy of it first
    if os.path.exists(filename):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_folder = "backups"
        
        # Make a backups folder if it's not there
        if not os.path.exists(backup_folder):
            os.makedirs(backup_folder)
            
        backup_file = os.path.join(backup_folder, f"{filename.replace('.csv', '')}_{timestamp}.csv")
        shutil.copy(filename, backup_file)
        print(f"Backed up {filename} to {backup_file}")

def get_chrome_driver():
    # Setting up the browser to run invisibly in the background
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("window-size=1920,1080")
    opts.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    return webdriver.Chrome(options=opts)

def scrape_category(driver, category):
    # This pulls out all the schemes for a specific category
    scraped_data = []
    
    for page in range(1, category['pages'] + 1):
        print(f"  -> Fetching page {page} out of {category['pages']}...")
        
        url = f"https://www.india.gov.in/my-government/schemes/search?schemeCategory={category['id']}&schemeCategoryName={category['url_name']}&pagenumber={page}"
        driver.get(url)
        
        # Wait until the scheme titles (h2 tags) actually show up on the page
        try:
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "h2")))
        except Exception:
            print(f"  -> Whoops, page {page} took too long to load or has no schemes. Moving on!")
            continue
            
        # Give the page a tiny bit of extra time to finish loading all the text
        time.sleep(2)
        
        # Parse the page structure
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Go through each scheme title we found
        for h2 in soup.find_all('h2'):
            link_tag = h2.find('a')
            if not link_tag:
                continue
                
            title = link_tag.text.strip()
            if not title:
                continue
                
            link = link_tag.get('href', '')
            if link and not link.startswith('http'):
                link = "https://www.india.gov.in" + link
                
            desc_tag = None
            tags_list = None
            
            # Find the description and tags right below this specific title
            for element in h2.find_all_next(['p', 'ul', 'h2']):
                # Stop if we hit the next scheme's title
                if element.name == 'h2':
                    break 
                if element.name == 'p' and not desc_tag:
                    desc_tag = element
                if element.name == 'ul' and not tags_list:
                    tags_list = element
                    
                if desc_tag and tags_list:
                    break
                    
            description = desc_tag.text.strip() if desc_tag else ""
            
            tags = []
            if tags_list:
                tags = [li.text.strip() for li in tags_list.find_all('li') if li.text.strip()]
            
            # Save this scheme's info
            scraped_data.append({
                'Title': title,
                'Link': link,
                'Description': description,
                'Tags': ", ".join(tags)
            })
            
    return pd.DataFrame(scraped_data)

if __name__ == "__main__":
    print("Welcome! Starting the multi-category web scraper...\n")
    
    # Here is our master list of all the categories, their links, and how many pages to fetch
    categories_to_scrape = [
        {"name": "Agriculture", "id": "12", "url_name": "Agriculture%2C+Rural+%26+Environment", "pages": 91, "file": "agriculture_schemes.csv"},
        {"name": "Benefits", "id": "8", "url_name": "Benefits%20%26%20Social%20development", "pages": 159, "file": "benefits_social_schemes.csv"},
        {"name": "Business", "id": "16", "url_name": "Business%20%26%20Self-employed", "pages": 83, "file": "business_self_employed_schemes.csv"},
        {"name": "Driving", "id": "9", "url_name": "Driving%20%26%20Transport", "pages": 11, "file": "driving_transport_schemes.csv"},
        {"name": "Education", "id": "1", "url_name": "Education%20%26%20Learning", "pages": 128, "file": "education_learning_schemes.csv"},
        {"name": "Health", "id": "5", "url_name": "Health%20%26%20Wellness", "pages": 31, "file": "health_wellness_schemes.csv"},
        {"name": "Housing", "id": "3", "url_name": "Housing%20%26%20Local%20services", "pages": 15, "file": "housing_local_services_schemes.csv"},
        {"name": "Jobs", "id": "2", "url_name": "Jobs", "pages": 45, "file": "jobs_schemes.csv"},
        {"name": "Justice", "id": "10", "url_name": "Justice%2C%20Law%20%26%20Grievances", "pages": 4, "file": "justice_law_grievances_schemes.csv"},
        {"name": "Money", "id": "7", "url_name": "Money%20%26%20Taxes", "pages": 40, "file": "money_taxes_schemes.csv"},
        {"name": "Science", "id": "14", "url_name": "Science%2C%20IT%20%26%20Communication", "pages": 15, "file": "science_it_communication_schemes.csv"},
        {"name": "Travel", "id": "6", "url_name": "Travel%20%26%20Tourism", "pages": 10, "file": "travel_tourism_schemes.csv"},
        {"name": "Welfare", "id": "4", "url_name": "Welfare%20of%20Families", "pages": 53, "file": "welfare_of_families_schemes.csv"},
        {"name": "Youth", "id": "13", "url_name": "Youth%20sports%20%26%20Culture", "pages": 29, "file": "youth_sports_culture_schemes.csv"}
    ]
    
    try:
        driver = get_chrome_driver()
        
        # Let's loop through each category in our master list
        for category in categories_to_scrape:
            print(f"\n--- Now scraping the '{category['name']}' category ({category['pages']} pages) ---")
            
            # Back up any existing data for this category
            create_backup(category['file'])
            
            # Fetch the new data
            df = scrape_category(driver, category)
            
            if not df.empty:
                df.to_csv(category['file'], index=False, encoding='utf-8')
                print(f"Awesome! Saved {len(df)} schemes to {category['file']}")
            else:
                print(f"Hmm, no data was found for {category['name']}.")
                
    except Exception as e:
        print(f"Something went wrong: {e}")
    finally:
        # Always make sure to close the browser when we're done
        print("\nAll done! Closing the browser.")
        driver.quit()
