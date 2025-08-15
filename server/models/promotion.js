const mongoose = require('mongoose');


// Define a schema for products in promotions
const promoProductSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }, // Quantity for the promotion
    mainPrice: { type: Number, required: true, min: 0 }, // Price of the product before promotion
    promoPrice: { type: Number, required: true, min: 0 } // Price of the product after promotion
}, { _id: false });


// create promotion object model
const promotionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['new stock', 'discount promo', 'buyOneGetOne'], required: true },
    description: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    discountPercentage: { type: Number, required: false, min: 0, max: 100 }, // Applicable for discount promos
    buyOneGetOne: { type: Boolean, default: false, validate: {
        validator: function() {
            // Ensure that buyOneGetOne is only true if the type is 'buyOneGetOne'
            return this.type !== 'buyOneGetOne' || this.buyOneGetOne === true;
        },
        message: 'Buy one get one promotion must be enabled for type "buyOneGetOne"'
    } }, // Applicable for buy one get one promos
    products: [promoProductSchema], // Array of products included in the promotion
    active: { type: Boolean, default: true }, // Whether the promotion is currently active
    promoBanner: { type: String, required: false }, // Cover image URL for the promotion
}, { timestamps: true });

// Enable toJSON and toObject methods to include virtuals
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

// Create a model from the schema
const Promotion = mongoose.model('Promotion', promotionSchema, 'promotions');
// Export the model
module.exports = Promotion;