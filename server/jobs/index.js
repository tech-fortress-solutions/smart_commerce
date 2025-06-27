// background worker jobs entry point
require('dotenv').config();

// import the email worker
require('./email/worker');