const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
// Connect to the database
connectDB();

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);

// error middleware
app.use(errorMiddleware);


//export the app
module.exports = app;