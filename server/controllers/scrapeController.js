const axios = require('axios'); 
const cheerio = require('cheerio');
const ScrapedFile = require('../models/ScrapedFile');

// Function to scrape the website and save data into MongoDB
exports.scrapeWebsite = async (req, res) => {
    const { website_url } = req.body;
    if (!website_url) {
        return res.status(400).json({ error: 'Website URL is required' });
    }
    try {
        // Clear previous files from MongoDB
        await ScrapedFile.deleteMany({});

        // Scrape the content of the website using axios
        const response = await axios.get(website_url);
        const scrapedContent = response.data;

        // Use cheerio to parse the HTML and extract text
        const $ = cheerio.load(scrapedContent);
        const textContent = $('p, h1, h2, h3').map((i, el) => $(el).text()).get().join('\n').trim();

        // If textContent is empty
        if (!textContent) {
            return res.status(400).json({ error: 'No content found on the page' });
        }

        // Save the main page content
        const mainFile = new ScrapedFile({
            file_name: `${new Date().toISOString().replace(/[:.]/g, '-')}.txt`,
            url: website_url,
            scraped_content: textContent
        });

        await mainFile.save(); // Save the main scraped file

        // Log the saved main file
        console.log('Saved main file:', mainFile); 

        // Scrape links from the main page (if needed)
        const links = $('a').map((i, el) => $(el).attr('href')).get();

        // Filter unique links to avoid duplicates
        const uniqueLinks = [...new Set(links)];

        await scrapeMultipleLinks(uniqueLinks); // Scrape found unique links

        // Return response with saved main file info
        res.status(200).json({
            file_name: mainFile.file_name,
            url: mainFile.url,
            scraped_content: mainFile.scraped_content 
        });
    } catch (error) {
        console.error('Error scraping website:', error.message);
        res.status(500).json({ error: 'Failed to scrape the website' });
    }
};

// Function to scrape multiple unique links
const scrapeMultipleLinks = async (links) => {
    for (const link of links) {
        if (link.startsWith('http')) { // Check if the link is valid
            try {
                const existingFile = await ScrapedFile.findOne({ url: link });
                if (existingFile) {
                    console.log('File already exists:', existingFile.file_name);
                    continue; // Skip if the file already exists
                }

                const response = await axios.get(link);
                const scrapedContent = response.data;
                const $ = cheerio.load(scrapedContent);

                const textContent = $('p, h1, h2, h3').map((i, el) => $(el).text()).get().join('\n').trim();

                // Save each scraped link content
                const newFile = new ScrapedFile({
                    file_name: `${new Date().toISOString().replace(/[:.]/g, '-')}-${link.replace(/https?:\/\//, '').replace(/[\/:]/g, '-')}.txt`,
                    url: link,
                    scraped_content: textContent
                });

                await newFile.save(); // Save the new scraped file
                console.log('Saved file:', newFile); // Log the saved file
            } catch (error) {
                console.error('Error scraping link:', link, error.message);
            }
        }
    }
};



// Function to fetch all scraped files from MongoDB
exports.getAllScrapedFiles = async (req, res) => {
    try {
        const files = await ScrapedFile.find();
        res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching scraped files:', error);
        res.status(500).json({ error: 'Failed to fetch scraped files' });
    }
};

// Function to get a single scraped file by filename
exports.getScrapedFileContent = async (req, res) => {
    const { filename } = req.params;
    try {
        const file = await ScrapedFile.findOne({ file_name: filename });
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ scraped_content: file.scraped_content });
    } catch (error) {
        console.error('Error fetching file content:', error);
        res.status(500).json({ error: 'Failed to fetch file content' });
    }
};
