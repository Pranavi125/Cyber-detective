import React, { useState } from 'react';
import axios from 'axios';
import './AttributionClassification.css'; 

function AttributionClassification() {
  const [sentence, setSentence] = useState('');  // Store the sentence input by the user
  const [classificationResult, setClassificationResult] = useState(null);  // Store the classification result
  const [isLoading, setIsLoading] = useState(false);  // Loading state for the classification process
  const [error, setError] = useState('');  // Store any error messages
  const [showDetails, setShowDetails] = useState(false); // State to control the visibility of static details box

  // Handle input changes
  const handleInputChange = (e) => {
    setSentence(e.target.value);
    setError('');
  };

  // Function to call the backend API for classification
  const handleClassify = async () => {
    if (!sentence.trim()) {
      setError("Please enter a sentence to classify.");
      return;
    }

    setIsLoading(true);
    setError('');
    setClassificationResult(null);
    setShowDetails(false);

    try {
      // Replace with your backend URL for classification
      const response = await axios.post('http://localhost:5001/api/classify', { text: sentence });
      
      // Store the result (word_entity_mapping is expected from the backend)
      setClassificationResult(response.data.word_entity_mapping);  // Update with the correct field name
      setShowDetails(true); // Show the details after classification
    } catch (err) {
      setError("Error while classifying. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="attribution-classification-container">
      <div className="attribution-classification">
        <h2>Attribution Annotation/Classification</h2>
        
        <div>
          <textarea
            rows="4"
            value={sentence}
            onChange={handleInputChange}
            placeholder="Enter sentence here"
            disabled={isLoading}
          />
        </div>

        <button onClick={handleClassify} disabled={isLoading}>
          {isLoading ? 'Classifying...' : 'Classify'}
        </button>

        {error && <p className="error">{error}</p>}

        {classificationResult && (
          <div className="classification-result">
            <h3>Classification Result:</h3>
            <ul>
              {Object.entries(classificationResult).map(([word, entity], index) => (
                <li key={index}>
                  <strong>{word}:</strong> {entity} {/* Displaying word and corresponding entity */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Static details container, shown after classification result */}
      {showDetails && (
        <div className="details-box">
          <h4>Details:</h4>
          <p>Accuracy: 90.97%</p>
          <p>BLEU Score: 89.14%</p>
        </div>
      )}
    </div>
  );
}

export default AttributionClassification;
