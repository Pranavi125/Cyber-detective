const express = require('express');
const dotenv = require('dotenv').config()
const cors = require('cors');
const {mongoose} = require('mongoose')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes'); // Adjust the path as needed


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

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`))

