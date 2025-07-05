const { AppError } = require('../utils/error');
const { createProductService, getAllProductsService, getProductsByCategoryService, getProductByIdService } = require('../services/productService');
const { getCategoryByNameService } = require('../services/categoryService');
const { uploadImageService } = require('../services/uploadService');


// create product controller
const createProductController = async (req, res, next) => {
    try {
        const productData = req.body;
        // validate fields and entry
        if (!productData.name || !productData.price || !productData.quantity || !productData.category) {
            return next(new AppError("Required field is missing", 400));
        }
        productData.name = productData.name.trim().toLowerCase();

        // parse price and quantity to numbers
        productData.price = parseInt(productData.price, 10);
        productData.quantity = parseInt(productData.quantity, 10);

        // validate price and quantity
        if (isNaN(productData.price) || isNaN(productData.quantity)) {
            return next(new AppError('Price and quantity must be valid numbers', 400));
        }

        // get category id service
        const categoryObj = await getCategoryByNameService(productData.category);
        if (!categoryObj) {
            return next(new AppError('Category not found!', 404));
        }
        productData.category = categoryObj._id;

        // get and upload cover and other images
        if (req.files && req.files.cover) {
            const coverImage = req.files.cover[0];
            if (!coverImage) {
                return next(new AppError('Cover image is required', 400));
            }
            const coverImageUrl = await uploadImageService(coverImage);
            if (!coverImageUrl) {
                return next(new AppError('Failed to upload cover image', 500));
            }
            productData.thumbnail = coverImageUrl;
        }

        // handle other images which are optional
        if (req.files && req.files.images) {
            const images = req.files.images;
            const imageUrls = [];
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const imageUrl = await uploadImageService(images[i]);
                    imageUrls.push(imageUrl);
                }
            }
            if (imageUrls.length > 0) {
                productData.images = imageUrls;
            }
        }

        // create product using service
        const product = await createProductService(productData);
        if (!product) {
            return next(new AppError('Failed to create product', 500));
        }

        return res.status(201).json({
            status: 'success',
            message: 'Product created successfully',
            data: [product.toObject()]
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error creating product:', error);
        return next(new AppError('Failed to create product', 500)); // Handle other errors gracefully
    }
};


// get all products controller
const getAllProductsController = async (req, res, next) => {
    try {
        // get all products using the service
        const products = await getAllProductsService();
        if (!products || products.length === 0) {
            return next(new AppError('No products found', 404));
        }
        // Return response with the list of products
        res.status(200).json({
            status: 'success',
            message: 'Products fetched successfully',
            data: products.map(product => product.toObject())
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error fetching products:', error);
        return next(new AppError('Failed to fetch products', 500)); // Handle other errors gracefully
    }
};


// export functions
module.exports = {
    createProductController, getAllProductsController,
};