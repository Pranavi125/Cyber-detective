import os
import requests
from bs4 import BeautifulSoup
from newspaper import Article, Config
import time
import re
import sys
import json

config = Config()
config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'

key_terms = [
    "exploit", "phishing", "ransomware", "exfiltrate", "malicious",
    "Sandworm", "UNC2452", "LockBit", "Cuba", "Hack520",
    "PowerShell", "C2 server", "command line interfaces", "Microsoft Office", "Open Babel",
    "CVE-2022-41040", "CVE-2022-41080", "zero day",
    "ransomware", "CozyDuke", "CosmicEnergy"
]

def sanitize_filename(title):
    return re.sub(r'[\\/*?:"<>|]', "", title)

def scrape_articles(site):
    scraped_articles = []
    visited_urls = set()
    max_articles = 50  # Limit number of articles to scrape

    try:
        response = requests.get(site, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        article_links = soup.find_all('a', href=True)
        for count, link in enumerate(article_links):
            if count >= max_articles:
                break  # Stop if we've reached the maximum

            url = link['href']
            if not url.startswith('http'):
                url = site.rstrip('/') + '/' + url.lstrip('/')

            if url in visited_urls:
                continue  # Skip already visited URLs
            visited_urls.add(url)

            try:
                article = Article(url, config=config)
                article.download()
                article.parse()

                if any(term.lower() in article.text.lower() for term in key_terms):
                    scraped_articles.append({
                        'title': article.title,
                        'url': url
                    })
                time.sleep(1)  # Delay between requests

            except Exception as e:
                continue
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


    return scraped_articles

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide a URL to scrape."}))
        sys.exit(1)

    site = sys.argv[1]
    articles = scrape_articles(site)

    print(json.dumps(articles))