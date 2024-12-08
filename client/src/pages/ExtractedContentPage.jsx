import React from 'react';
import { useLocation } from 'react-router-dom';
import './ExtractedContentPage.css';

const ExtractedContentPage = () => {
    const location = useLocation();
    const { content, filename } = location.state;

    return (
        <div className="extracted-content-page">
            <h1>Extracted Content</h1>
            <p><strong>File:</strong> {filename}</p>
            <div className="content-box">
                <pre>{content}</pre>
            </div>
        </div>
    );
};

export default ExtractedContentPage;
