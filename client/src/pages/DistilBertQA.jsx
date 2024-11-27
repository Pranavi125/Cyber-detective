import React, { useState } from 'react';
import './DistilBertQA.css';

const DistilBertQA = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/qa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
    
            const data = await response.json();
            setAnswer(data.answer); // Display the answer from the backend
        } catch (error) {
            console.error('Error:', error);
            setAnswer('Failed to get answer. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
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
            {answer && <div><h3>Answer:</h3><p>{answer}</p></div>}
        </div>
    );
};

export default DistilBertQA;
