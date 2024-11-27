import os
import requests
from bs4 import BeautifulSoup
from newspaper import Article, Config
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from pymongo import MongoClient
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app, supports_credentials=True)


# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['web_scraping_db']
collection = db['scraped_articles']

# Config for scraping
config = Config()
config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'

save_folder = "scraped_articles"
os.makedirs(save_folder, exist_ok=True)

key_terms = ["cloud", "security", "hybrid", "network", "detection", "response", "managed services"]  # Define your key terms here

def sanitize_filename(title):
    return re.sub(r'[\\/*?:"<>|]', "", title)

def scrape_articles(site):
    saved_articles = []
    response = requests.get(site, headers={'User-Agent': config.browser_user_agent})
    soup = BeautifulSoup(response.text, 'html.parser')
    article_links = soup.find_all('a', href=True)

    for link in article_links:
        url = link['href']
        if not url.startswith('http'):
            url = site + url

        try:
            article = Article(url, config=config)
            article.download()
            article.parse()

            # Check if any key term exists in the article text
            if any(term in article.text for term in key_terms):
                title = sanitize_filename(article.title)
                file_path = os.path.join(save_folder, f"{title}.txt")

                if os.path.exists(file_path):
                    continue

                # Save file locally
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(f"Title: {article.title}\n")
                    f.write(f"URL: {url}\n")
                    f.write(f"Published Date: {article.publish_date}\n\n")
                    f.write(article.text)

                # Save data to MongoDB
                scraped_data = {
                    "file_name": f"{title}.txt",
                    "url": url,
                    "scraped_content": article.text,
                    "timestamp": datetime.now(timezone.utc)
                }
                collection.insert_one(scraped_data)

                saved_articles.append({'title': title, 'url': url})
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")

    return saved_articles

@app.route('/api/scrape', methods=['POST'])
def scrape():
    data = request.json
    target_site = data.get('url')
    print(f"Received URL: {target_site}") 

    if not target_site:
        return jsonify({'error': 'URL is required'}), 400
    print(f"Scraping URL: {target_site}") 
    try:
        articles = scrape_articles(target_site)
        return jsonify({'message': 'Scraping completed', 'articles': articles}), 200
    except Exception as e:
        return jsonify({'error': 'An error occurred during scraping', 'details': str(e)}), 500

@app.route('/api/scraped-files', methods=['GET'])
def get_scraped_files():
    files = collection.find({}, {"file_name": 1, "url": 1})
    files_list = [{'file_name': file['file_name'], 'url': file['url']} for file in files]
    return jsonify({'articles': files_list})

@app.route('/api/scraped-files/<file_name>', methods=['GET'])
def get_file_content(file_name):
    file = collection.find_one({"file_name": file_name})
    if file:
        return jsonify({'scraped_content': file['scraped_content']})
    return jsonify({'error': 'File not found'}), 404




# Paths to the saved .pkl files
output_dir = "C:/Users/Tukaram/Desktop/3-1 ps/mlmodel"  # Update with your directory
model_path = os.path.join(output_dir, "xgboost_model.pkl")
vectorizer_path = os.path.join(output_dir, "vectorizer.pkl")
mlb_path = os.path.join(output_dir, "mlb.pkl")

# Load the pre-trained model, vectorizer, and MultiLabelBinarizer
model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)
mlb = joblib.load(mlb_path)

def predict_word_mapping_single_entity(input_text, model, vectorizer, mlb):
   
    # Split the input text into words
    words = input_text.split()

    # Initialize the word-to-entity map
    word_entity_map = {}

    for word in words:
        # Preprocess each word (convert to vector)
        input_vector = vectorizer.transform([word]).toarray()

        # Predict probabilities for the word
        pred_probs = model.predict_proba(input_vector)

        # Get the entity with the highest probability
        max_prob_index = pred_probs.argmax(axis=1)[0]
        predicted_entity = mlb.classes_[max_prob_index]

        # Map the word to the most relevant entity
        word_entity_map[word] = predicted_entity

    return word_entity_map

@app.route('/api/classify', methods=['POST'])
def classify_text():
    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Predict the word-to-entity mapping
    word_to_entity_map = predict_word_mapping_single_entity(text, model, vectorizer, mlb)

    return jsonify({'word_entity_mapping': word_to_entity_map})

if __name__ == '__main__':
    app.run(debug=True, port=5001)

