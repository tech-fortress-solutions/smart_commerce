const puppeteer = require('puppeteer');
const { format } = require('date-fns');
const handlebars = require('handlebars');
const { uploadImageService, uploadPdfService } = require('../services/uploadService');
const { formatAmount } = require('./helper');

handlebars.registerHelper('multiply', (a, b) => a * b);

const generateReceiptFiles = async (orderData, brandInfo) => {
  try {
    const formattedDate = format(new Date(orderData.paidAt), 'dd/MM/yyyy HH:mm:ss');
    const formattedTotalAmount = formatAmount(orderData.totalAmount, orderData.currency);

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #ffffff;
      color: #000;
      padding: 40px;
      position: relative;
    }
    body::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 60%;
      height: 60%;
      background-image: url('{{brand.logo}}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.15;
      transform: translate(-50%, -50%);
      z-index: 0;
    }
    .receipt {
      width: 100%;
      max-width: 800px;
      margin: auto;
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      margin: 0;
    }
    .info, .footer {
      margin-top: 20px;
      font-size: 14px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .table th, .table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .table th {
      background-color: #f2f2f2;
    }
    .total-row {
      font-weight: bold;
      background-color: #f9f9f9;
    }
    .thank-you {
      margin-top: 30px;
      font-size: 15px;
    }
    .brand {
      margin-top: 20px;
      font-size: 13px;
      color: #444;
    }
    .brand-logo {
      max-height: 80px;
      max-width: 120px;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>{{brand.name}}</h1>
      <img src="{{brand.logo}}" alt="Brand Logo" class="brand-logo" />
    </div>
    <p><strong>Order Receipt</strong></p>
    <p>Purchase Date: {{formattedDate}}</p>
    <p>Reference: {{reference}}</p>
    <p>Client: {{clientName}}</p>

    <h3>Items Purchased</h3>
    <table class="table">
      <thead>
        <tr>
          <th>S/N</th>
          <th>Description</th>
          <th>Quantity</th>
          <th>Unit Price ({{currency}})</th>
        </tr>
      </thead>
      <tbody>
        {{#each products}}
        <tr>
          <td>{{inc @index}}</td>
          <td>{{description}}</td>
          <td>{{quantity}}</td>
          <td>{{price}}</td>
        </tr>
        {{/each}}
        <tr class="total-row">
          <td colspan="3">Total</td>
          <td>{{formattedTotalAmount}}</td>
        </tr>
      </tbody>
    </table>

    <div class="thank-you">
      <h4>Thank you for choosing {{brand.name}}!</h4>
      <p>
       We truly value your trust and support. If you enjoyed your experience, we’d be grateful if you could leave us a review—it helps us improve and serve you better.
       We look forward to welcoming you back soon for more great finds. 
      </p>
      <p>
        For any questions, feedback, or assistance, feel free to reach out through our contact channels.
      </p>
    </div>

    <div class="brand">
      <p><strong>{{brand.name}}</strong> &bull; {{brand.address}}</p>
      <p>📞 Phone: {{brand.phone}} &bull; WhatsApp: {{brand.whatsapp}}</p>
      <p>📧 Email: {{brand.email}} &bull; 🌐 Website: {{brand.website}}</p>
      <p><em>Built by Tech Fortress – Web & App Solutions</em></p>
    </div>
  </div>
</body>
</html>
    `;

    // register a helper to increment @index by 1 (so it's 1-based)
    handlebars.registerHelper('inc', function (value) {
      return parseInt(value) + 1;
    });

    const template = handlebars.compile(htmlTemplate);
    const html = template({
      ...orderData,
      brand: brandInfo,
      formattedDate,
      formattedTotalAmount,
    });

    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser'
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    await browser.close();

    const pdfFile = {
      buffer: pdfBuffer,
      mimetype: 'application/pdf',
      originalname: `receipt-${orderData.reference}.pdf`,
    };

    const imageFile = {
      buffer: screenshotBuffer,
      mimetype: 'image/jpeg',
      originalname: `receipt-${orderData.reference}.jpg`,
    };

    const [pdfUrl, jpgUrl] = await Promise.all([
      uploadPdfService(pdfFile),
      uploadImageService(imageFile),
    ]);

    return { pdfUrl, jpgUrl };
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    throw new Error('Receipt generation failed');
  }
};

module.exports = { generateReceiptFiles };
