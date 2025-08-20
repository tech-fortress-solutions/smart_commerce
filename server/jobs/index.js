// background worker jobs entry point
const puppeteer = require('puppeteer');
const { format } = require('date-fns');
const handlebars = require('handlebars');
require('dotenv').config();
const connectDB = require('../config/db');
const Category = require('../models/category');
const Order = require('../models/order');

// start worker function
const startWorker = async () => {
    try {
        // connect to the database
        await connectDB();

        // import email worker
        require('./email/worker');

        // import the delete promo queue
        require('./deletePromo/queue');

        // import the delete promo worker
        require('./deletePromo/worker');

        // import the create receipt worker
        require('./createReciepts/worker');
        
        console.log('Worker started successfully.');
    } catch (error) {
        console.error('Error starting worker:', error);
        process.exit(1); // Exit the process with failure
    }
};

// start the worker
startWorker();