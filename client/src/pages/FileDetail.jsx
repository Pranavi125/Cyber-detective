import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
//import { UserContext } from '../../context/userContext';
import './FileDetail.css';

const FileDetail = () => {
    const { filename } = useParams();
    const [fileContent, setFileContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFileContent = async () => {
            try {
                const encodedFilename = encodeURIComponent(filename);
                const response = await fetch(`http://localhost:8000/auth/api/scraped-files/${encodedFilename}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch file content');
                }
                const data = await response.json();
                setFileContent(data.scraped_content || '');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFileContent();
    }, [filename]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="file-detail">
            {/* Completely remove the Navbar */}
            <h2>File: {filename}</h2>
            <pre>{fileContent}</pre>
        </div>
    );
};

export default FileDetail;
