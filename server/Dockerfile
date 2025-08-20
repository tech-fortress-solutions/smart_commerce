# Stage 1: The Build Stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the builder stage
COPY package*.json ./

# Install project dependencies
# We will not install them here to avoid the cross-platform issue.
# We will do it in the final stage instead.

# Copy the rest of the application source code
COPY . .

# ---

# Stage 2: The Production Stage
FROM ghcr.io/puppeteer/puppeteer:21.6.0

# Switch to the root user to install packages
USER root

# Set working directory
WORKDIR /app

# Copy the application source code
COPY --from=builder /app ./

# Install Node.js dependencies in the final image
RUN npm install

# Switch back to the non-root user for security
USER pptruser

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]