const express = require('express');
const router = express.Router();
const axios = require('axios');
const { JSDOM } = require('jsdom');

// Function to clean extracted text
const cleanText = (text) => {
  return text
    .replace(/[^\w\s.,]/g, '')  // Remove special characters except punctuation
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();
};

// Extract content from a URL
const extractWebsiteContent = async (url) => {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const paragraphs = dom.window.document.querySelectorAll('p');
    const text = Array.from(paragraphs).map(p => p.textContent).join(' ');

    // Clean the extracted text before returning
    return cleanText(text);
  } catch (error) {
    throw new Error('Error extracting content: ' + error.message);
  }
};

// POST route to extract content
router.post('/extract', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  try {
    const content = await extractWebsiteContent(url);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
