const mongoose = require('mongoose');
const Order = require('../models/order');
const { AppError } = require('../utils/error');
const { setRedisCache, getRedisCache, deleteRedisCache } = require('../config/redis');


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
        const order = await getRedisCache(reference);
        if (!order) {
            throw new AppError('Order not found in cache', 404);
        }
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

        // delete the staged order from redis cache
        await deleteRedisCache(newOrder.reference);

        return newOrder;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error creating order:', error);
        throw new AppError('Failed to create order', 500);
    }
};


// get all orders order by date
const getAllOrdersService = async () => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            throw new AppError('No orders found', 404);
        }
        return orders;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error retrieving orders:', error);
        throw new AppError('Failed to retrieve orders', 500);
    }
};


// get order by reference
const getOrderByReferenceService = async (reference) => {
    try {
        if (!reference) {
            throw new AppError('No reference provided', 400);
        }

        const order = await Order.findOne({ reference });
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        return order;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error retrieving order by reference:', error);
        throw new AppError('Failed to retrieve order by reference', 500);
    }
};


// confirm order purchase service
const confirmPurchaseService = async (reference) => {
    try {
        if (!reference) {
            throw new AppError('No reference provided', 400);
        }

        //get order by reference
        const order = await getOrderByReferenceService(reference);
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        // check if order is already paid
        if (order.status === 'paid') {
            throw new AppError('Order already paid', 400);
        }

        // create a status object
        const status = {
            status: "paid",
            paidAt: new Date(),
        };
        // update order in database
        const updatedOrder = await Order.findOneAndUpdate({ reference }, status, { new: true });
        if (!updatedOrder) {
            throw new AppError('Order not found or already paid', 404);
        }
        // return updated order
        return updatedOrder;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error confirming order purchase:', error);
        throw new AppError('Failed to confirm order purchase', 500);
    }
};


// update order service
const updateOrderService = async (reference, updateData) => {
    try {
        if (!reference || !updateData) {
            throw new AppError('Reference and update data are required', 400);
        }

        // find and update order by reference
        const updatedOrder = await Order.findOneAndUpdate({ reference }, updateData, { new: true });
        if (!updatedOrder) {
            throw new AppError('Order not found or could not be updated', 404);
        }

        return updatedOrder;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error updating order:', error);
        throw new AppError('Failed to update order', 500);
    }
};


// Delete order service
const deleteOrderService = async (reference) => {
    try {
        if (!reference) {
            throw new AppError('No reference provided', 400);
        }

        // find and delete order by reference
        const deletedOrder = await Order.findOneAndDelete({ reference });
        if (!deletedOrder) {
            throw new AppError('Order not found or could not be deleted', 404);
        }

        return deletedOrder;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error deleting order:', error);
        throw new AppError('Failed to delete order', 500);
    }
};


// Get user's orders service
const getUserOrdersService = async (userId) => {
    try {
        if (!userId) {
            throw new AppError('No user ID provided', 400);
        }

        // validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user ID', 400);
        }

        // find orders by user ID
        const orders = await Order.find({ clientId: userId }).sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            throw new AppError('No orders found for this user', 404);
        }
        return orders;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error retrieving user orders:', error);
        throw new AppError('Failed to retrieve user orders', 500);
    }
};



// export functions
module.exports = {
    createOrderService, stageOrderService, retrieveOrderService, getAllOrdersService,
    getOrderByReferenceService, confirmPurchaseService, updateOrderService, deleteOrderService,
    getUserOrdersService,
};