import React, { useState } from 'react';
import './DistilBertQA.css';

const DistilBertQA = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false); // State to control the visibility of static details box

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/qa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch answer');
            }

            const data = await response.json();

            if (data.answer === "No valid answer found") {
                setAnswer("The model could not provide a valid answer. Please try a different question.");
            } else {
                setAnswer(data.answer); // Display the answer from the backend
            }
            setShowDetails(true); // Show the details box after the answer is received
        } catch (error) {
            console.error('Error:', error);
            setAnswer('Failed to get answer. Please try again.');
            setShowDetails(false); // Hide the details box if there's an error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Main container for question and answer */}
            <div className='qabox'>
                <h2>DistilBERT Question Answering</h2>
                <div>
                    <input 
                        type="text" 
                        placeholder="Ask your question" 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)} 
                    />
                    <button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Loading...' : 'Submit'}
                    </button>
                </div>
                {answer && (
                    <div>
                        <h3>Answer:</h3>
                        <p>{answer}</p>
                    </div>
                )}
            </div>

            {/* Static details container, shown after submit */}
            {showDetails && (
                <div className="details-box">
                    <h4>Details:</h4>
                    <p>Accuracy: 76.48%</p>
                    <p>BLEU Score: 85.84%</p>
                </div>
            )}
        </div>
    );
};

export default DistilBertQA;
