const { Queue } = require('bullmq');
const { redisClient } = require('../../config/redis');
const { AppError } = require('../../utils/error');

// Create a new queue for deleting promotions
const deletePromoQueue = new Queue('deletePromo', { connection: redisClient });

// Function to add a job to the delete promotion queue
const scheduleDeletePromoJob = async () => {
    try {
        await deletePromoQueue.add('deletePromotion', {}, {
            repeat: {
                cron: '0 0 * * *', // Run every day at midnight
            },
            removeOnComplete: true, // Remove job from queue after completion
            removeOnFail: false, // Keep failed jobs for debugging
            attempts: 3, // Retry failed jobs up to 3 times
            backoff: {
                type: 'exponential', // Use exponential backoff for retries
                delay: 5000, // Initial delay of 5 seconds,
            },
        });
        console.log('Delete promotion job scheduled successfully.');
    } catch (error) {
        console.error('Error scheduling delete promotion job:', error);
        throw new AppError('Failed to schedule delete promotion job', 500);
    }
};

// call the function to schedule the job
scheduleDeletePromoJob();