const { sanitize } = require('../utils/helper'); // Import sanitize-html for sanitizing inputs
const { AppError } = require('../utils/error');
const { createProductService, getAllProductsService, getProductsByCategoryService, getProductByIdService,
    updateProductService, deleteProductService
 } = require('../services/productService');
const { getCategoryByNameService } = require('../services/categoryService');
const { uploadImageService, deleteImageService } = require('../services/uploadService');


// create product controller
const createProductController = async (req, res, next) => {
    try {
        const productData = req.body;
        // validate fields and entry
        if (!productData.name || !productData.price || !productData.quantity || !productData.category || !productData.description) {
            return next(new AppError("Required field is missing", 400));
        }
        productData.name = sanitize(productData.name);

        if (productData.description) {
            productData.description = sanitize(productData.description);
        }

        // parse price and quantity to numbers
        productData.price = parseInt(productData.price, 10);
        productData.quantity = parseInt(productData.quantity, 10);

        // validate price and quantity
        if (isNaN(productData.price) || isNaN(productData.quantity)) {
            return next(new AppError('Price and quantity must be valid numbers', 400));
        }

        // get category id service
        if (productData.category) {
            productData.category = sanitize(productData.category.trim());
        }
        const categoryObj = await getCategoryByNameService(productData.category);
        if (!categoryObj) {
            return next(new AppError('Category not found!', 404));
        }
        productData.category = categoryObj._id;

        // Confirm if product is in promotion
        if (productData.promotion && productData.promotion !== 'none') {
            productData.inPromotion = true;
            if (productData.promoId) {
                productData.promoId = sanitize(productData.promoId);
            }
            if (productData.promoTitle) {
                productData.promoTitle = sanitize(productData.promoTitle);
            }
        }

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
            const imageUrls = await Promise.all(images.map(image => uploadImageService(image)));
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


// get products by category controller
const getProductsByCategoryController = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!categoryId) {
            return next(new AppError("No category ID provided", 400));
        }

        // get products by category using service
        const products = await getProductsByCategoryService(categoryId);
        if (!products || products.length === 0) {
            return next(new AppError("No Products Found for this category", 404));
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
        console.error('Error fetching products by category ID:', error);
        return next(new AppError('Failed to fetch products', 500)); // Handle other errors gracefully
    }
};


// get product by id controller
const getProductByIdController = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return next(new AppError("No product ID provided", 400));
        }

        // get product by id using service
        const product = await getProductByIdService(productId);
        if (!product) {
            return next(new AppError("No Product Found", 404));
        }
        // Return response with the product details
        res.status(200).json({
            status: 'success',
            message: 'Product fetched successfully',
            data: product.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error fetching product by ID:', error);
        return next(new AppError('Failed to fetch product', 500)); // Handle other errors gracefully
    }
};


// update product controller
const updateProductController = async (req, res, next) => {
    try {
        // get product id
        const productId = req.params.id;
        if (!productId) {
            return next(new AppError("No product ID provided", 400));
        }
        // get product by id using service
        const product = await getProductByIdService(productId);
        if (!product) {
            return next(new AppError("No Product Found", 404));
        }

        // get and validate updated product data
        const updateData = req.body;
        if ((!updateData || Object.keys(updateData).length === 0) && (!req.files || Object.keys(req.files).length === 0)) {
            return next(new AppError("No update data provided", 400));
        }
        if (updateData.name) {
            updateData.name = sanitize(updateData.name);
        }
        // parse price and quantity to numbers
        if (updateData.price) {
            updateData.price = parseInt(updateData.price, 10);
            if (isNaN(updateData.price)) {
                return next(new AppError('Price must be a valid number', 400));
            }
        }
        if (updateData.quantity) {
            updateData.quantity = parseInt(updateData.quantity, 10);
            if (isNaN(updateData.quantity)) {
                return next(new AppError('Quantity must be a valid number', 400));
            }
        }
        // get category id if provided
        if (updateData.category) {
            updateData.category = sanitize(updateData.category);
            const categoryObj = await getCategoryByNameService(updateData.category);
            if (!categoryObj) {
                return next(new AppError('Category not found!', 404));
            }
            updateData.category = categoryObj._id;
        }
        // handle description update
        if (updateData.description) {
            updateData.description = sanitize(updateData.description);
        }
        // handle promotion update
        if (updateData.promotion && updateData.promotion !== 'none') {
            updateData.inPromotion = true;
        }
        // handle promoId and promoTitle update
        if (updateData.promoId) {
            updateData.promoId = sanitize(updateData.promoId);
        }
        if (updateData.promoTitle) {
            updateData.promoTitle = sanitize(updateData.promoTitle);
        }
        // handle cover image update
        if (req.files && req.files.cover) {
            const coverImage = req.files.cover[0];
            if (!coverImage) {
                return next(new AppError('Cover image is missing', 400));
            }
            if (product.thumbnail) {
                // delete old cover image if exists
                await deleteImageService(product.thumbnail);
            }
            const coverImageUrl = await uploadImageService(coverImage);
            if (!coverImageUrl) {
                return next(new AppError('Failed to upload cover image', 500));
            }
            updateData.thumbnail = coverImageUrl;
        }
        // handle other images update
        if (req.files && req.files.images) {
            let indexes = [];
            try {
                indexes = JSON.parse(updateData.indexes) || [];
                if (!indexes || !Array.isArray(indexes)) {
                    return next(new AppError('Indexes for images are required', 400));
                }
            } catch (error) {
                console.error('Error parsing indexes:', error);
            }
            const images = req.files.images;
            const indexSet = new Set(indexes); // Use a Set for faster lookup
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const image = await uploadImageService(images[i]);
                    if (!image) {
                        return next(new AppError('Failed to upload image', 500));
                    }
                    // check if index is an index of an already uploaded image
                    if (indexSet.has(i) && i < product.images.length && i >= 0) {
                        // delete image and update image
                        await deleteImageService(product.images[i]);
                        product.images[i] = image;
                    } else {
                        product.images.push(image);
                    }
                }
            }
        }

        // delete old images if requested
        if (updateData.deleteImages) {
            // sort delete indexes in descending order
            if (typeof updateData.deleteImages === 'string') {
                try {
                    updateData.deleteImages = JSON.parse(updateData.deleteImages);
                } catch (error) {
                    return next(new AppError('Invalid delete images format', 400));
                }
            } else {
                updateData.deleteImages = updateData.deleteImages;
            }

            const deleteIndexes = updateData.deleteImages.map(index => parseInt(index, 10));
            if (!deleteIndexes || !Array.isArray(deleteIndexes)) {
                return next(new AppError('Delete indexes for images are required', 400));
            }
            deleteIndexes.sort((a, b) => b - a);
            for (const index of deleteIndexes) {
                if (product.images[index]) {
                    await deleteImageService(product.images[index]);
                    product.images.splice(index, 1); // Remove the image from the array
                }
            }
        }

        // reset thumbnail if not provided
        if (!updateData.thumbnail) {
            updateData.thumbnail = product.thumbnail; // Keep the existing thumbnail if not updated
        }
        // update updated product data for images
        updateData.images = product.images || [];
        // update product using service
        const updatedProduct = await updateProductService(productId, updateData);
        if (!updatedProduct) {
            return next(new AppError('Failed to update product', 500));
        }

        // Return response with the updated product
        res.status(200).json({
            status: 'success',
            message: 'Product updated successfully',
            data: updatedProduct.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error updating product:', error);
        return next(new AppError('Failed to update product', 500)); // Handle other errors gracefully
    }
};


// delete product controller
const deleteProductController = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return next(new AppError("No product ID provided", 400));
        }
        // get product by id using service
        const product = await getProductByIdService(productId);
        if (!product) {
            return next(new AppError("No Product Found", 404));
        }
        // delete cover image if exists
        if (product.thumbnail) {
            await deleteImageService(product.thumbnail);
        }
        // delete other images if exists
        if (product.images && product.images.length > 0) {
            await Promise.all(product.images.map(image => deleteImageService(image)));
        }
        // delete product using service
        const deletedProduct = await deleteProductService(productId);
        if (!deletedProduct) {
            return next(new AppError('Failed to delete product', 500));
        }

        // Return response indicating successful deletion
        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully',
            data: deletedProduct.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error deleting product:', error);
        return next(new AppError('Failed to delete product', 500)); // Handle other errors gracefully
    }
};


// export functions
module.exports = {
    createProductController, getAllProductsController, getProductsByCategoryController, getProductByIdController,
    updateProductController, deleteProductController
};