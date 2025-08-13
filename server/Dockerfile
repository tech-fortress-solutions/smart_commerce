# Backend Docker file
FROM node:20.18.2-alpine3.19

# set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source files
COPY server/ ./

# Expose the port the app runs on
EXPOSE 5000

# start server
CMD ["node", "server.js"]