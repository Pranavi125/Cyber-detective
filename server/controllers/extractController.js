const express = require('express');
const router = express.Router();
const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Function to clean extracted text
const cleanText = (text) => {
  return text
    .replace(/[^\w\s.,]/g, '')  // Remove special characters except punctuation
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();
};

// Function to extract content from a URL
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

// Function to save content to file
const saveContentToFile = (content, filename) => {
    const folderPath = path.join(__dirname, 'extracted'); // 'extracted' folder inside the server directory
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath); // Create the folder if it doesn't exist
    }
  
    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Content saved to ${filePath}`);
    return filename; // Return the filename to be used in the response
  };
  

// POST route to extract content and save it to a file
// POST route to extract content and save it to a file
router.post('/extract', async (req, res) => {
    const { url } = req.body;
  
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
  
    try {
      const content = await extractWebsiteContent(url);
  
      // Clean and create a valid filename from the URL
      const baseFilename = url.replace("https://", "").replace("http://", "").replace(/[^\w\s.-]/g, '_');
      const filename = `${baseFilename}.txt`;
  
      // Save the content to a file in the extracted folder inside the server directory
      const savedFilename = saveContentToFile(content, filename);
  
      // Respond with success, the content, and the filename
      res.json({ success: true, content, filename: savedFilename });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

module.exports = router;
