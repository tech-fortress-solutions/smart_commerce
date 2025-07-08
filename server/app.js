const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { querySanitizeMiddleware } = require('./middleware/querySanitizeMiddleware')
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();
// Connect to the database
connectDB();

const app = express();

app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        credentials: true, // Allow cookies to be sent with requests
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }
));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(querySanitizeMiddleware);
app.use(helmet());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/category', categoryRoutes);
app.use('/api/admin/product', productRoutes);
app.use('/api/admin/orders', orderRoutes);

// error middleware
app.use(errorMiddleware);


//export the app
module.exports = app;