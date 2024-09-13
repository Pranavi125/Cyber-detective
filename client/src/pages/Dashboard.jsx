import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import './Dashboard.css';

export default function Dashboard() {
    const { user, logout } = useContext(UserContext); // Ensure `logout` is available
    const navigate = useNavigate(); // Initialize navigate hook

    const handleLogout = (event) => {
        event.preventDefault(); // Prevent default anchor tag behavior

        // Display a confirmation dialog
        const confirmLogout = window.confirm('Are you sure you want to logout?');

        if (confirmLogout) {
            if (typeof logout === 'function') {
                logout(); // Call the logout function to clear user session
                
                // Use a setTimeout to allow state updates or async logout operations to complete
                setTimeout(() => {
                    navigate('/'); // Navigate to home page after logout
                }, 100); // Small delay to ensure logout completes
            } else {
                console.error('Logout function is not available');
            }
        }
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <a href="/" className="nav-button" onClick={handleLogout}>Logout</a>
            </nav>
            <h1>Dashboard</h1>
        </div>
    );
}
