#!/bin/bash
echo "Starting to scrape 91 pages (this will take 15-20 minutes)..."
python scraper.py
echo "Scraping completed. Committing and pushing to GitHub..."
git add scraper.py agriculture_schemes.csv
git commit -m "Scrape all 91 pages of agriculture schemes and update scraper"
git push
echo "All done!"
