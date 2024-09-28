const express = require('express');
const router = express.Router();
const cors = require('cors');
const { exec } = require('child_process');
const { test, registerUser, loginUser, getProfile , logout, verifyOTP, forgotPassword, resetPassword, scrapeArticles} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Import your auth middleware

// Middleware for CORS
router.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
    })
);

// Test route
router.get('/', test);

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// OTP verification route
router.post('/verify-otp', verifyOTP);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

// Route to scrape articles
router.post('/scrape-articles', (req, res) => {
    const site = req.body.url;  // Get the URL from the request body

    exec(`python3 scraper.py ${site}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing scraper: ${error}`);
            console.error(`stderr: ${stderr}`);  // Log the stderr for more details
            return res.json({ error: "An error occurred while scraping articles." });
        }
        
        // Parse the JSON output from the Python script
        let articles;
        try {
            articles = JSON.parse(stdout);
            res.json({ success: true, articles }); // Return the articles to the client
        } catch (jsonError) {
            console.error(`JSON parsing error: ${jsonError}`);
            return res.json({ error: "Failed to parse articles." });
        }
    });
});


router.post('/logout', logout);

// Profile route - Protected by auth middleware
router.get('/profile', authMiddleware, getProfile);


module.exports = router;