const { Worker } = require('bullmq');
const { redisClient } = require('../../config/redis');
const { generateReceiptFiles } = require('../../utils/generateReciept');
const { updateOrderService } = require('../../services/orderService');
const { AppError } = require('../../utils/error');


// Create a worker to process create receipt jobs
const createReceiptWorker = new Worker('createReciept', async (job) => {
    try {
        console.log("processing create receipt job:", job.id);
        const { orderData, brandInfo } = job.data;
        // Call the generateReceipt function to create the receipt
        const receiptUrls = await generateReceiptFiles(orderData, brandInfo);
        // Update the order with the receipt URLs
        const updatedOrder = await updateOrderService(orderData.reference, {
            receiptPdf: receiptUrls.pdfUrl,
            receiptImage: receiptUrls.jpgUrl,
        });
        if (!updatedOrder) {
            throw new AppError('Failed to update order with receipt URLs', 404);
        }
        console.log("Create receipt job completed successfully:", job.id);
    } catch (error) {
        console.error("Error processing create receipt job:", error);
        // Handle the error, you can rethrow it to retry the job
        throw new AppError('Failed to process create receipt job', 500);
    }
}, { connection: redisClient });

// Listen for worker errors
createReceiptWorker.on('failed', (job, err) => {
    console.error(`Create receipt job failed: ${job.id}, Error: ${err.message}`);
});