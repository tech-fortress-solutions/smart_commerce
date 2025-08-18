# Backend Docker file
FROM node:20-alpine3.21

RUN apk add --no-cache wget

# Install required dependencies for Puppeteer.
# These packages are the Alpine equivalents of the ones needed on Debian/Ubuntu.
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    openjpeg \
    glib \
    cairo \
    pango \
    && rm -rf /var/cache/apk/*

# set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend source files
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# start server
CMD ["node", "server.js"]