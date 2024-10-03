import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const { user, logout } = useContext(UserContext);
    const [url, setUrl] = useState('');           // To store the entered URL
    const [isLoading, setIsLoading] = useState(false);  // To handle loading state
    const [error, setError] = useState('');       // To handle any error messages
    const navigate = useNavigate();

    const handleLogout = async (event) => {
        event.preventDefault();

        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            if (typeof logout === 'function') {
                try {
                    await logout(); // Call the logout function to clear user session
                    navigate('/');  // Redirect to home page after logout
                } catch (error) {
                    console.error('Logout failed:', error.response?.data || error.message);
                }
            } else {
                console.error('Logout function is not available');
            }
        }
    };

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
        <div className='dashboard'>
            <nav className='navbar'>
                <button className='nav-button' onClick={handleLogout}>Logout</button>
            </nav>
            <h1>Dashboard</h1>
            <div className='search-bar'>
                <form onSubmit={handleSubmit}>
                    <input 
                        type='url' 
                        placeholder='Enter Website URL' 
                        value={url}
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    <button type='submit' disabled={isLoading}>
                        {isLoading ? 'Scraping...' : 'Scrape'}
                    </button>
                </form>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
};
