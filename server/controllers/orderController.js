const { AppError } = require('../utils/error');
const { stageOrderService, retrieveOrderService, createOrderService, getAllOrdersService,
    getOrderByReferenceService, confirmPurchaseService, updateOrderService
 } = require('../services/orderService');
 const { updateProductService, getProductByIdService } = require('../services/productService');
const { sanitize, buildWhatsAppMessage } = require('../utils/helper');
const { generateReceiptFiles } = require('../utils/generateReciept');
const { parse } = require('handlebars');


// stage order controller
const stageOrderController = async (req, res, next) => {
    try {
        const { clientName, products, totalAmount, currency, clientId  } = req.body;
        // validate order data
        if (!clientName || !products || !totalAmount || !currency) {
            throw new AppError('Invalid order data', 400);
        }
        if (!Array.isArray(products) || products.length === 0) {
            throw new AppError('Products must be a non-empty array', 400);
        }
        // generate unique reference for the order
        const { nanoid } = await import('nanoid');
        const reference = nanoid(10);
        // stage order in redis cache
        const orderData = {
            clientName: sanitize(clientName),
            products: products.map(p => ({
                product: sanitize(p.product),
                description: sanitize(p.description),
                price: parseInt(sanitize(p.price), 10),
                quantity: sanitize(p.quantity),
                thumbnail: new URL(p.thumbnail).toString(), // Ensure thumbnail is a valid URL
                currency: sanitize(p.currency || currency), // Use provided currency or default to 'NGN'

            })),
            totalAmount: parseInt(sanitize(totalAmount), 10), // Ensure totalAmount is an integer
            reference
        };
        if (clientId) {
            orderData.clientId = sanitize(clientId); // Add clientId if provided
        }
        const stagedReference = await stageOrderService(reference, orderData);
        if (!stagedReference) {
            throw new AppError('Failed to stage order in cache', 500);
        }

        // Build whatsapp message with order details
        const encodedwhatsappMessage = buildWhatsAppMessage({
            clientName: orderData.clientName,
            products: orderData.products,
            totalAmount: orderData.totalAmount,
            reference: stagedReference,
            currency: orderData.currency || 'NGN', // Default to 'NGN' if not provided
        });

        res.status(200).json({
            status: 'success',
            message: 'Order staged successfully',
            checkoutUrl: `https://wa.me/${process.env.ADMIN_PHONE}?text=${encodedwhatsappMessage}`,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Pass custom AppError to the error handler
        }
        console.error('Error staging order:', error);
        return next(new AppError('Failed to stage order', 500));
    }
};


// retrieve pending order controller
const retrieveOrderController = async (req, res, next) => {
    try {
        const { reference } = req.params;
        if (!reference) {
            throw new AppError('No reference provided', 400);
        }
        // retrieve order from redis cache
        const order = await retrieveOrderService(reference);
        if (!order) {
            throw new AppError('Order not found in cache', 404);
        }
        res.status(200).json({
            status: 'success',
            message: 'Order retrieved successfully',
            data: order, // Convert Mongoose document to plain object
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Pass custom AppError to the error handler
        }
        console.error('Error retrieving order:', error);
        return next(new AppError('Failed to retrieve order', 500));
    }
};


// Create a new order controller
const createOrderController = async (req, res, next) => {
    try {
        const { clientName, products, totalAmount, currency, clientId } = req.body;
        // validate order data
        if (!clientName || !products || !totalAmount || !currency) {
            throw new AppError('Invalid order data', 400);
        }
        if (!Array.isArray(products) || products.length === 0) {
            throw new AppError('Products must be a non-empty array', 400);
        }

        // get reference from request parameters
        const { reference } = req.params;
        if (!reference) {
            throw new AppError('No reference provided', 400);
        }
        // create a new order data object and sanitize inputs
        const orderData = {
            clientName: sanitize(clientName),
            products: products.map(p => ({
                product: sanitize(p.product),
                description: sanitize(p.description),
                price: parseInt(sanitize(p.price), 10),
                quantity: sanitize(p.quantity),
                thumbnail: new URL(p.thumbnail).toString(), // Ensure thumbnail is a valid URL
                currency: sanitize(p.currency || currency), // Use provided currency or default to 'NGN'
            })),
            totalAmount: parseInt(sanitize(totalAmount), 10), // Ensure totalAmount is an integer
            reference: sanitize(reference),
        };
        // add clientId if provided
        if (clientId) {
            orderData.clientId = sanitize(clientId);
        }
        // create a new order in the database
        const newOrder = await createOrderService(orderData);
        if (!newOrder) {
            throw new AppError('Failed to create order', 500);
        }
        res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            data: newOrder.toObject(),
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Pass custom AppError to the error handler
        }
        console.error('Error creating order:', error);
        return next(new AppError('Failed to create order', 500));
    }
};


// get all orders controller
const getAllOrdersController = async (req, res, next) => {
    try {
        const orders = await getAllOrdersService();
        if (!orders || orders.length === 0) {
            throw new AppError('No orders found', 404);
        }
        res.status(200).json({
            status: 'success',
            message: 'Orders retrieved successfully',
            data: orders,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Pass custom AppError to the error handler
        }
        console.error('Error retrieving orders:', error);
        return next(new AppError('Failed to retrieve orders', 500));
    }
};


// get order by reference controller
const getOrderByReferenceController = async (req, res, next) => {
    try {
        const { reference } = req.params;
        if (!reference) {
            throw new AppError('No reference provided', 400);
        }
        // get order from database
        const order = await getOrderByReferenceService(reference);
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        res.status(200).json({
            status: 'success',
            message: 'Order retrieved successfully',
            data: order.toObject(),
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Pass custom AppError to the error handler
        }
        console.error('Error retrieving order by reference:', error);
        return next(new AppError('Failed to retrieve order by reference', 500));
    }
};


// confirm purchase and generate receipt controller
const confirmPurchaseController = async (req, res, next) => {
    try {
        const reference = req.params.reference;
        if (!reference) {
            return next(new AppError("Reference is missing!", 400));
        }

        // retrieve order
        const orderObj = await getOrderByReferenceService(reference);
        if (!orderObj) {
            return next(new AppError("Order not found!", 404));
        }

        // update product stock
        for (const product of orderObj.products) {
            if (!product.product || !product.quantity) {
                return next(new AppError("Invalid product data in order", 400));
            }
            // get product from database
            const productData = await getProductByIdService(product.product);
            if (!productData) {
                return next(new AppError(`Product with ID ${product.product} not found`, 404));
            }
            // check if product has enough stock
            if (productData.quantity < product.quantity) {
                return next(new AppError(`Insufficient stock for product ${productData.name}`, 400));
            }
            // update product stock
            await updateProductService(product.product, {
                quantity: parseInt(productData.quantity - product.quantity, 10),
            });
        }

        // confirm purchase and generate receipt
        const order = await confirmPurchaseService(reference);
        if (!order) {
            return next(new AppError("Order not found or already confirmed!", 404));
        }

        const brandInfo = {
            name: process.env.BRAND_NAME || 'Smart Commerce',
            logo: process.env.BRAND_LOGO_URL || 'https://example.com/logo.png',
            address: process.env.BRAND_ADDRESS || '123 Main St, City, Country',
            phone: process.env.ADMIN_PHONE || '+1234567890',
            email: process.env.BRAND_EMAIL || 'realcharlieok@gmail.com',
            whatsapp: process.env.ADMIN_PHONE || '+1234567890',
        };
        // generate receipt files
        const recieptUrls = await generateReceiptFiles(order.toObject(), brandInfo);
        if (!recieptUrls || !recieptUrls.pdfUrl || !recieptUrls.jpgUrl) {
            return next(new AppError("Failed to generate receipt", 500));
        }
        // update order with receipt URLs
        const updatedOrder = await updateOrderService(reference, {
            receiptPdf: recieptUrls.pdfUrl,
            receiptImage: recieptUrls.jpgUrl,
        });
        if (!updatedOrder) {
            return next(new AppError("Failed to update order with receipt URLs", 500));
        }

        //return response with order and receipt URLs
        res.status(200).json({
            status: 'success',
            message: 'Order confirmed and receipt generated successfully',
            data: {
                order,
                receipt: {
                    pdfUrl: recieptUrls.pdfUrl,
                    jpgUrl: recieptUrls.jpgUrl,
                },
            },
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Pass custom AppError to the error handler
        }
        console.error('Error confirming purchase:', error);
        return next(new AppError('Failed to confirm purchase', 500));
    }
};


// export order controller
module.exports = {
    stageOrderController, retrieveOrderController, createOrderController, getAllOrdersController,
    getOrderByReferenceController, confirmPurchaseController,
};