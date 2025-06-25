const http = require('http');
const app = require('./app');
const PORT = process.env.PORT || 3000;
const { redisClient } = require('./config/redis');


const server = http.createServer(app);

// handle redis connection
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});