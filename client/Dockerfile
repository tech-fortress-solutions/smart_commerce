# Runtime image (no build step)
FROM node:20-alpine3.21

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the already built files from host to container
COPY .next ./.next
COPY public ./public

# Copy any other required files (like next.config.js, etc.)
COPY next.config.* ./
COPY .env ./.env

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]