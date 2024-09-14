const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

// Test endpoint
const test = (req, res) => {
    res.json('Test is working');
};

// Register endpoint
const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body;

        // Validate input
        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.json({ error: 'All the fields are required' });
        }
      
      if (password.length < 6) {
        return res.json({ error: 'Password must be at least 6 characters long' });
      }
      
    if (password !== confirmPassword) return res.json({ error: 'Passwords do not match' });
    if (!/^\d{10}$/.test(phone)) return res.json({ error: 'Phone number must be exactly 10 digits long' });
    
    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    const existingUserByPhone = await User.findOne({ phone });

    if (existingUser) {
        return res.json({ error: 'Email is already taken' });
      }
      if (existingUserByPhone) {
        return res.json({ error: 'Phone number is already taken' });
      }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    // Return user details (excluding password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error code
      return res.json({ error: 'Email or Phone number already in use' });
    }
    console.error(error);
    res.json({ error: 'Server error' });
  }
};

// Login endpoint
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email) return res.json({ error: 'Email is required' });
        if (!password) return res.json({ error: 'Password is required' });

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.json({ error: 'No user found' });

        // Check if passwords match
        const match = await comparePassword(password, user.password);
        if (match) {
            // Sign the JWT token with expiration
            const token = jwt.sign({ email: user.email, id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Set the token in cookies 
            res.cookie('token', token, { httpOnly: true});

            // Send success response
            res.json({ message: 'Login successful'});
        } else {
            return res.json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error', error);
        return res.json({ error: 'Server error' });
    }
};

// Logout endpoint
const logout = (req, res) => {
  try {
      // Clear the cookie
      res.clearCookie('token'); // Adjust the cookie name as necessary
      res.json({ message: 'Logged out successfully' });
  } catch (error) {
      console.error(error);
      res.json({ error: 'Server error' });
  }
};

// Get profile endpoint
const getProfile = (req, res) => {
    const { token } = req.cookies;
  
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          // Send error response as JSON without status code
          console.error('Token verification error:', err);
          return res.json({ error: 'Unauthorized' });
        }
        // Send user profile as JSON
        res.json(user);
      });
    } else {
      // Send error response as JSON without status code
      console.error('No token found in cookies');
      res.json({ error: 'No token provided' });
    }
  };

module.exports = {
    test,
    registerUser,
    loginUser,
    logout,
    getProfile
};
