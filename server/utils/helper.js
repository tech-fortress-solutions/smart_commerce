// Description: Helper functions for various utilities
const sanitizeHtml = require('sanitize-html');
const { AppError } = require('./error');
const puppeteer = require('puppeteer');


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
    throw new AppError('Input must be a string, number or boolean', 400);
  }

  const cleanInput = sanitizeHtml(String(input), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return cleanInput.trim();
};


// format currency to a standard format
const formatAmount = (amount, currency = 'NGN') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new AppError('Amount must be a valid number', 400);
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount);
};


// whatsapp message builder for orders with a link shortener
const buildWhatsAppMessage = ({ clientName, products, totalAmount, reference, currency }) => {
  // Validate input
  if (!clientName || !products || !totalAmount || !reference || !currency) {
    throw new AppError('Invalid order data for WhatsApp message', 400);
  }

  // format products for message maximum length of 10 products
  const formattedProducts = products.slice(0, 10).map(p => `\n- ${p.description} (Qty: ${p.quantity}, Price: ${formatAmount(p.price, currency)})`).join('');
  const remainingProductsCount = products.length - 10;
  const additionalProductsMessage = remainingProductsCount > 0 ? `\n...and ${remainingProductsCount} more products` : '';

  // format total amount
  const formattedTotalAmount = formatAmount(totalAmount, currency);
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Build the WhatsApp message
  const message = `
  New Pending Order:
  Client Name: ${clientName}
  Reference: ${reference}
  Total Amount: ${formattedTotalAmount}
  Products: ${formattedProducts}${additionalProductsMessage}
  [For Vendor Use Only] Click the link to create the order: ${baseUrl}/api/admin/orders/${reference}`;

  return encodeURIComponent(message);
};


// Convert HTML to image file
const htmlToImage = async (promoTitle, html) => {
  try {
    if (!html || typeof html !== 'string') {
      throw new AppError('Invalid HTML content', 400);
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    await browser.close();
    const imageFile = {
      contentType: 'image/png',
      buffer: screenshotBuffer,
      originalname: `${promoTitle}.png`,
      mimetype: 'image/png',
    }
    return imageFile;
  } catch (error) {
    console.error('Error converting HTML to image:', error);
    throw new AppError('Failed to convert HTML to image', 500);
  }
};


// export the helper functions
module.exports = {
  extractFileKey,
  sanitize,
  buildWhatsAppMessage,
  formatAmount,
  htmlToImage,
};