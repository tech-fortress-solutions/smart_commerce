// Description: Helper functions for various utilities


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


// export the helper functions
module.exports = {
  extractFileKey,
};