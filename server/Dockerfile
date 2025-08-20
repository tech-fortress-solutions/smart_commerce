# Stage 1: The Build Stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application (if applicable, e.g., for TypeScript)
# RUN npm run build

# ---

# Stage 2: The Production Stage
FROM ghcr.io/puppeteer/puppeteer:21.6.0

# Install wget in the final image for the health check
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the 'builder' stage
COPY --from=builder /app ./

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]