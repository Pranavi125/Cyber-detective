import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
//import { UserContext } from '../../context/userContext';

const ScrapedFiles = () => {
    
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch('http://localhost:8000/auth/api/scraped-files');
                if (!response.ok) {
                    throw new Error('Failed to fetch files');
                }
                const data = await response.json();
                setFiles(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching files:', err);
            }
        };

        fetchFiles();
    }, []);

    

    return (
        <div className="scraped-files">
            {/* Completely remove the Navbar */}
            <h2>Scraped Files</h2>
            {error && <p>Error: {error}</p>}
            <ul>
                {files.map(file => (
                    <li key={file.file_name}>
                        <Link to={`/file-detail/${file.file_name}`}>
                            {file.file_name} - {new Date(file.createdAt).toLocaleString()}
                        </Link>
                    </li>
                ))}
            </ul>
            
        </div>
    );
};

export default ScrapedFiles;
