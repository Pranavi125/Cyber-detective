import { useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import './Dashboard.css';
import axios from 'axios';

export default function Dashboard() {
    const { user, logout } = useContext(UserContext); // Ensure `logout` is available
    const navigate = useNavigate(); // Initialize navigate hook
    const [url, setUrl] = useState(''); // State to store the input URL
    const [scrapedArticles, setScrapedArticles] = useState([]); // State to store scraped articles
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const handleLogout = async (event) => {
        event.preventDefault(); // Prevent default anchor tag behavior

        // Display a confirmation dialog
        const confirmLogout = window.confirm('Are you sure you want to logout?');

        if (confirmLogout) {
            if (typeof logout === 'function') {
                try {
                    await logout(); // Call the logout function to clear user session
                    
                    // Redirect to home page after logout
                    navigate('/'); 
                } catch (error) {
                    console.error('Logout failed:', error.response?.data || error.message);
                }
            } else {
                console.error('Logout function is not available');
            }
        }
    };
   
    // Function to handle URL submission for scraping
    const handleScrape = async () => {
        setLoading(true); // Set loading to true when scraping starts
        try {
            const response = await axios.post('http://localhost:8000/auth/scrape-articles', { url });
            if (response.data.success) {
                setScrapedArticles(response.data.articles);
                setError(null);  // Clear error if the request is successful
            } else {
                setError(response.data.message || 'Failed to scrape articles.');
            }
        } catch (err) {
            setError('An error occurred while scraping articles.');
        } finally {
            setLoading(false); // Set loading to false when scraping is done
        }
    };

    

    return (
        <div className="dashboard">
            <nav className="navbar">
                <a href="/" className="nav-button" onClick={handleLogout}>Logout</a>
            </nav>
            <h1>Dashboard</h1>

            {/* Add URL input field and submit button */}
            <div className="scrape-section">
                <input 
                    type="text" 
                    placeholder="Enter website URL" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    className="url-input"
                />
                <button onClick={handleScrape} disabled={loading} className="scrape-button">
                    {loading ? 'Scraping...' : 'Scrape Articles'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            <div>
                <h2>Scraped Articles:</h2>
                <ul>
                    {scrapedArticles.map((article, index) => (
                        <li key={index}>{article.title}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}