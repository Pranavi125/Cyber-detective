from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, AdamW
from torch.utils.data import DataLoader, TensorDataset, random_split
import pandas as pd
from sklearn.metrics import accuracy_score
import nltk

# Ensure nltk data is downloaded for BLEU scoring
nltk.download('punkt')

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)  # Enable CORS for all routes, you can limit this to specific domains later

# Load dataset
qa_data = pd.read_csv("C:/Users/Tukaram/Desktop/3-1 ps/qamodel/QA pairs for Specific_Content (1).csv", encoding='ISO-8859-1')

# Create a list of unique answers (classes)
answers = list(qa_data['Ground Truth'].unique())

# Create a mapping of answers to class labels
answer_to_label = {answer: idx for idx, answer in enumerate(answers)}
label_to_answer = {idx: answer for answer, idx in answer_to_label.items()}

# Convert answers in the dataset to class labels
qa_data['label'] = qa_data['Ground Truth'].map(answer_to_label)

# Load DistilBERT tokenizer
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')

# Tokenize the questions
inputs = tokenizer(
    qa_data['Question'].tolist(),
    max_length=128,
    padding='max_length',
    truncation=True,
    return_tensors="pt"
)

input_ids = inputs['input_ids']
attention_masks = inputs['attention_mask']
labels = torch.tensor(qa_data['label'].values)

# Create TensorDataset
dataset = TensorDataset(input_ids, attention_masks, labels)

# Split dataset into training and validation sets
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

# DataLoader for batching
batch_size = 16
train_dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
val_dataloader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

# Load pre-trained DistilBERT model for Sequence Classification
num_labels = len(answers)
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=num_labels)

# Move model to GPU if available
device = torch.device("cpu")  # Change to "cuda" if using GPU
model.to(device)

# Prepare optimizer
optimizer = AdamW(model.parameters(), lr=5e-5)

# Training loop
epochs = 10
for epoch in range(epochs):
    model.train()
    total_loss = 0

    for batch in train_dataloader:
        # Unpack the batch and move to the appropriate device
        b_input_ids = batch[0].to(device)
        b_attention_mask = batch[1].to(device)
        b_labels = batch[2].to(device)

        # Zero the gradients
        model.zero_grad()

        # Forward pass
        outputs = model(input_ids=b_input_ids, attention_mask=b_attention_mask, labels=b_labels)
        loss = outputs.loss

        # Backward pass and optimization
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_train_loss = total_loss / len(train_dataloader)
    print(f"Epoch {epoch+1} - Loss: {avg_train_loss:.4f}")

# Prediction function
def answer_question(question):
    inputs = tokenizer(question, return_tensors="pt", max_length=128, truncation=True, padding='max_length').to(device)
    with torch.no_grad():
        outputs = model(**inputs)

    # Get the predicted class (the most likely answer)
    predicted_class = torch.argmax(outputs.logits, dim=1).item()
    return label_to_answer[predicted_class]

# API endpoint for question answering
@app.route('/api/qa', methods=['POST'])
def qa():
    data = request.get_json()
    question = data.get('question')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # Get the answer from the model
    answer = answer_question(question)
    return jsonify({'answer': answer})

# API endpoint for model evaluation
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
    app.run(debug=True, host='0.0.0.0', port=5000)
