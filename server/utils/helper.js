// Description: Helper functions for various utilities
const sanitizeHtml = require('sanitize-html');
const { AppError } = require('./error');


const extractFileKey = (url) => {
  try {
    const urlParts = new URL(url);
    const bucketPath = `/${process.env.S3_BUCKET}/`;
    if (urlParts.pathname.startsWith(bucketPath)) {
      return urlParts.pathname.replace(bucketPath, '');
    }
    return null;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
};


const sanitize = (input) => {
  if (typeof input !== 'string' && typeof input !== 'number' && typeof input !== 'boolean') {
    throw new AppError('Input must be a string', 400);
  }

  const cleanInput = sanitizeHtml(String(input), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return cleanInput.trim();
};


// export the helper functions
module.exports = {
  extractFileKey,
  sanitize,
};