// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 5000,
  path: '/api/user/test', // Or whatever your health check endpoint is
  timeout: 2000,
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure
  }
});

req.on('error', (err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1); // Failure
});

req.end();