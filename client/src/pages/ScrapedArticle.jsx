import React from 'react';

const ScrapedArticles = () => {
    const articles = JSON.parse(localStorage.getItem('scrapedArticles')) || [];

    return (
        <div>
            <h1>Scraped Articles</h1>
            {articles.length === 0 ? (
                <p>No articles found.</p>
            ) : (
                <ul>
                    {articles.map((article, index) => (
                        <li key={index}>
                            <h2>{article.title}</h2>
                            <p>{article.content}</p>
                            <a href={article.link} target="_blank" rel="noopener noreferrer">Read More</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ScrapedArticles;
