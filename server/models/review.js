// Review model
const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
    comment: { type: String, required: false, trim: true },
    reference: { type: String, required: true, trim: true }, // Unique reference for the review
    response: {
        comment: { type: String, required: false, trim: true },
        responder: { type: String, required: false, trim: true },
        responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        createdAt: { type: Date, default: Date.now }
    }
}, { timestamps: true });

// Enable toJSON and toObject methods to include virtuals
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

// create unique index for product and user combination
reviewSchema.index({ product: 1, user: 1, reference: 1 }, { unique: true });

// Virtual to get the reviewer's first and last name
reviewSchema.virtual('reviewerName').get(function () {
    return this.user && typeof this.user === 'object' ? `${this.user.firstname} ${this.user.lastname}` : null;
});


// Create a model from the schema
const Review = mongoose.model('Review', reviewSchema);
// Export the model
module.exports = Review;