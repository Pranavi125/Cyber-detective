const express = require('express');
const router = express.Router();
const cors = require('cors');
const { test, registerUser, loginUser, getProfile , logout} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Import your auth middleware

// Middleware for CORS
router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
);

// Test route
router.get('/', test);

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

router.post('/logout', logout);

// Profile route - Protected by auth middleware
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
