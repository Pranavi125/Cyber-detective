from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import pandas as pd
import os
import nltk
from sklearn.metrics import accuracy_score
# from nltk.translate.bleu_score import sentence_bleu
# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load the pre-trained model and tokenizer (qamodel)
model_dir = 'C:/Users/Tukaram/Desktop/3-1 ps/qamodel'
tokenizer = DistilBertTokenizer.from_pretrained(model_dir)
model = DistilBertForSequenceClassification.from_pretrained(model_dir)

# Move model to the appropriate device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Load dataset for mapping labels to answers (if needed)
qa_data = pd.read_csv("C:/Users/Tukaram/Desktop/3-1 ps/qamodel/CleanedQuestionsAnswersCSV.csv", encoding='ISO-8859-1')
answers = list(qa_data['Ground Truth'].unique())
answer_to_label = {answer: idx for idx, answer in enumerate(answers)}
label_to_answer = {idx: answer for answer, idx in answer_to_label.items()}
 # Prediction function
def answer_question(question):
    inputs = tokenizer(question, return_tensors="pt", max_length=128, truncation=True, padding='max_length').to(device)
    with torch.no_grad():
        outputs = model(**inputs)

    # Get the predicted class (the most likely answer)
    predicted_class = torch.argmax(outputs.logits, dim=1).item()
    return label_to_answer[predicted_class]
@app.route('/api/qa', methods=['POST'])
def qa():
    data = request.get_json()
    question = data.get('question')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # Get the answer from the model
    answer = answer_question(question)
    return jsonify({'answer': answer})
@app.route('/api/evaluate', methods=['GET'])
def evaluate_model():
    model.eval()
    true_labels = []
    predicted_labels = []

    for index, row in qa_data.iterrows():
        question = row['Question']
        true_answer = row['Ground Truth']
        predicted_answer = answer_question(question)

        # Convert true and predicted answers to labels
        true_label = answer_to_label[true_answer]
        predicted_label = answer_to_label[predicted_answer]

        true_labels.append(true_label)
        predicted_labels.append(predicted_label)

    # Compute overall accuracy
    accuracy = accuracy_score(true_labels, predicted_labels)
    return jsonify({'accuracy': accuracy * 100})

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=4000)