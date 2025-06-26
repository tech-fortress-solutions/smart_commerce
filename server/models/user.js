const mongoose = require('mongoose');


// create user object model
const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // Default role is 'user'
    address: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zipCode: { type: String, required: false }
    },
    phone: { type: String, required: true }
}, { timestamps: true });


// Create a model from the schema
const User = mongoose.model('User', userSchema);
// Export the model
module.exports = User;