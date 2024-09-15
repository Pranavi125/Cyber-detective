const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const OTPModel = require('../models/otp');
const crypto = require('crypto');
const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Test endpoint
const test = (req, res) => {
    res.json('Test is working');
};

// Register endpoint
const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, otpMethod } = req.body;

      // Trim values
      const trimmedPhone = phone.trim();
      const trimmedPassword = password.trim();
      const trimmedConfirmPassword = confirmPassword.trim();


      // Validate input
      if (!name || !email || !password || !confirmPassword || !phone || !otpMethod) {
          return res.json({ error: 'All the fields are required' });
      }

      if (trimmedPassword.length < 6) {
        return res.json({ error: 'Password must be at least 6 characters long' });
      }
      
    if (trimmedPassword !== trimmedConfirmPassword) return res.json({ error: 'Passwords do not match' });
    if (!/^\d{10}$/.test(trimmedPhone)) return res.json({ error: 'Phone number must be exactly 10 digits long' });
    
    // Check if email is already registered
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByPhone = await User.findOne({ phone: trimmedPhone });

    if (existingUserByEmail) {
        return res.json({ error: 'Email is already taken' });
      }
      if (existingUserByPhone) {
        return res.json({ error: 'Phone number is already taken' });
      }

      // Create user and hash password
      const hashedPassword = await hashPassword(trimmedPassword);
      const user = await User.create({
          name,
          email,
          password: hashedPassword,
          phone: trimmedPhone,
      });

    // Return user details (excluding password)
    //const { password: _, ...userWithoutPassword } = user.toObject();
    //res.json(userWithoutPassword);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await OTPModel.create({ userId: user._id, otp, expiresAt });

    console.log('Registering user with phone:', trimmedPhone);
    console.log('Sending OTP to phone:', `+91${trimmedPhone}`);


    // Send OTP based on otpMethod (email or phone)
    if (otpMethod === 'email') {
      console.log('Sending OTP via email');
      // Sending OTP via email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        secure: true,
        port: 465, 
      });
      

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,  // Dynamic recipient
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
      };
      

      await transporter.sendMail(mailOptions);
      console.log("OTP sent successfully via email");
    }else {
      const fullPhoneNumber = `+91${trimmedPhone}`; // Add country code dynamically
      console.log('Sending OTP to:', fullPhoneNumber);

      // SMS OTP
      await client.messages.create({
        body: `Your OTP code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: fullPhoneNumber,
    });
     // Automatically create and verify Caller ID
     try {
      await client.incomingPhoneNumbers.create({
          phoneNumber: fullPhoneNumber,
          friendlyName: `Verified Caller ID for ${trimmedPhone}`
      });
      console.log('Caller ID created successfully');
  } catch (err) {
      console.error('Error creating Caller ID:', err);
  }
}
    res.json({ message: `OTP sent via ${otpMethod}. Check your ${otpMethod === 'email' ? 'email' : 'phone'}.` });

  } catch (error) {
    if (error.code === 11000) { // Duplicate key error code
      return res.json({ error: 'Email or Phone number already in use' });
    }
    console.error('Error');
    console.error('Error during registration:', error);
    res.json({ error: 'Server error' });
  }
};

// Verify OTP endpoint
const verifyOTP = async (req, res) => {
  try {
    const { otp, email, phone } = req.body;

    console.log('Received OTP:', otp);
    console.log('Received Email:', email);
    console.log('Received Phone:', phone);

    if (!email || !phone) return res.json({ error: 'User information not found' });

    const user = await User.findOne({ email, phone });

    console.log('Found User:', user);

    if (!user) return res.json({ error: 'User not found' });

    const otpRecord = await OTPModel.findOne({ userId: user._id, otp });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.json({ error: 'Invalid or expired OTP' });
    }

    await OTPModel.deleteMany({ userId: user._id }); // OTP is valid, delete all OTPs for this user
    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error during OTP verification:', err);
    res.json({ error: 'An error occurred during OTP verification' });
  }
};

// Login endpoint
const loginUser = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // Validate input
        if (!email) return res.json({ error: 'Email is required' });
        if (!name) return res.json({ error: 'Name is required' });
        if (!password) return res.json({ error: 'Password is required' });

        // Check if user exists
        const user = await User.findOne({ email, name });
        if (!user){
           return res.json({ error: 'No user found with the given name and email' });
        }
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
    getProfile,
    verifyOTP
};
