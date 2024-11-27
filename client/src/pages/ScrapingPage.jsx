import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScrapingPage.css'; // Make sure to style it if necessary

export default function ScrapingPage() {
    const [url, setUrl] = useState('');           // To store the entered URL
    const [isLoading, setIsLoading] = useState(false);  // To handle loading state
    const [error, setError] = useState('');       // To handle any error messages
    const navigate = useNavigate();

    // Handle URL input change
    const handleInputChange = (e) => {
        setUrl(e.target.value);
        setError(''); // Clear the error when typing
    };

    // Handle form submit for scraping the URL
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);  // Set loading state to true
        setError('');        // Clear any existing errors

        try {
            const response = await fetch('http://localhost:8000/auth/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ website_url: url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server responded with error:', errorData);
                throw new Error(errorData.error || 'Failed to scrape URL');
            }

            // If successful, navigate to the ScrapedFiles page
            navigate('/scraped-files');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);  // Reset loading state
        }
    };

    return (
        <div className="scraping-page">
            <h1>Scrape a Website</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="url" 
                    placeholder="Enter Website URL" 
                    value={url}
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Scraping...' : 'Scrape'}
                </button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}