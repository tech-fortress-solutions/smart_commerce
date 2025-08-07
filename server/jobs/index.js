// background worker jobs entry point
require('dotenv').config();
const connectDB = require('../config/db');
const Category = require('../models/category');

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
        
        console.log('Worker started successfully.');
    } catch (error) {
        console.error('Error starting worker:', error);
        process.exit(1); // Exit the process with failure
    }
};

// start the worker
startWorker();