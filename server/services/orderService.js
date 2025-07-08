const mongoose = require('mongoose');
const Order = require('../models/order');
const { AppError } = require('../utils/error');
const { setRedisCache, getRedisCache } = require('../config/redis');


// stage order in redis cache
const stageOrderService = async (reference, orderData) => {
    try {
        if (!orderData || orderData.length === 0) {
            throw new AppError('No order data provided', 400);
        }

        // stringify order data for caching
        const orderDataString = JSON.stringify(orderData);

        // set order data in redis cache for 24 hours
        await setRedisCache(reference, orderDataString, 24 * 60 * 60); // 24 hours in seconds
        return reference;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error staging order in cache:', error);
        throw new AppError('Failed to stage order in cache', 500);
    }
};


// retrieve order from redis cache
const retrieveOrderService = async (reference) => {
    try {
        if (!reference) {
            throw new AppError('No reference provided', 400);
        }
        // get order data from redis cache
        const orderDataString = await getRedisCache(reference);
        if (!orderDataString) {
            throw new AppError('Order not found in cache', 404);
        }
        // parse order data from string to object
        const order = JSON.parse(orderDataString);
        return order;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error retrieving order from cache:', error);
        throw new AppError('Failed to retrieve order from cache', 500);
    }
};


// Create a new order
const createOrderService = async (orderData) => {
    try {
        if (!orderData || orderData.length === 0) {
            throw new AppError('No order data provided', 400);
        }

        // Create a new order instance
        const newOrder = await Order.create(orderData);
        if (!newOrder) {
            throw new AppError('Failed to create order', 500);
        }
        return newOrder;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error creating order:', error);
        throw new AppError('Failed to create order', 500);
    }
};


// export functions
module.exports = {
    createOrderService, stageOrderService, retrieveOrderService,
};