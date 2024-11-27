const express = require('express');
const dotenv = require('dotenv').config()
const cors = require('cors');
const {mongoose} = require('mongoose')
const cookieParser = require('cookie-parser')
const axios = require('axios');  // Import Axios for making HTTP requests
const { PythonShell } = require('python-shell'); // To call Python script from Node.js
const authRoutes = require('./routes/authRoutes'); // Adjust the path as needed
const scrapeRoutes = require('./routes/scrapeRoutes');  // Add this for scrape routes

const app = express();
//database connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Database connected'))
.catch((err) => console.log('Database not connected', err))

//middlewware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Use auth routes
app.use('/auth', authRoutes);
app.use('/scrape', scrapeRoutes);

// New route for interacting with the ML model
app.post('/api/ml/classify', async (req, res) => {
    const { text } = req.body;
    try {
      // Call the Python Flask API for classification
      const response = await axios.post('http://localhost:5001/api/classify', { text });
      res.json(response.data);  // Return the classification results
    } catch (error) {
      console.error('Error in ML classification:', error);
      res.json({ error: 'Failed to classify text' });
    }
  });
 // New route for interacting with the DistilBERT QA model
app.post('/api/qa', (req, res) => {
  const { question } = req.body;
  
  // Call the Python script to run the DistilBERT QA model
  let options = {
      args: [question]  // Pass the question as an argument to the Python script
  };

  PythonShell.run('server/distilbert_qa.py', options, function (err, result) {
      if (err) {
          console.error('Error running DistilBERT QA model:', err);
          return res.json({ error: 'Failed to process question' });
      }
      // Return the answer from the Python script
      res.json({ answer: result[0] });
  });
}); 
const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));