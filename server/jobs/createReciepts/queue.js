const { Queue } = require('bullmq');
const { redisClient } = require('../../config/redis');
const { AppError } = require('../../utils/error');


const createRecieptQueue = new Queue('createReciept', { 
    connection: redisClient,
    defaultJobOptions: {
        attempts: 3, // Number of retry attempts
        backoff: {
            type: 'exponential', // Exponential backoff
            delay: 5000 // Initial delay of 5 seconds
        },
        removeOnComplete: true, // Remove job from queue when completed
        removeOnFail: false // Keep failed jobs in the queue
    }
});

// Function to add a job to the createReciept queue
const addCreateRecieptJob = async (jobData) => {
    try {
        await createRecieptQueue.add('generateReceipt', jobData);
        console.log('Create receipt job added to the queue:', jobData.orderData.reference);
    } catch (error) {
        console.error('Error adding create receipt job to the queue:', error);
        throw new AppError('Failed to add create receipt job to the queue', 500);
    }
};

module.exports = {
    addCreateRecieptJob,
}