const User = require('../models/user');
const { AppError } = require('../utils/error');


// function to create a new user
const createUserService = async (userData) => {
    try {
        // Check if user already exists with the same email
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new AppError('User already exists with this email', 400);
        }

        // check for duplicate phone number
        const existingPhone = await User.findOne({ phone: userData.phone });
        if (existingPhone) {
            throw new AppError('User already exists with this phone number', 400);
        }

        // Create a new user instance
        const newUser = await User.create(userData);
        return newUser;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error creating user:', error);
        throw new AppError('Error creating user', 500);
    }
};


// export functions
module.exports = {
    createUserService,
};