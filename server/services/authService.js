const User = require('../models/user');
const { AppError } = require('../utils/error');
const { hashString } = require('../utils/hashString');
const { verifyJwtToken } = require('../utils/jwtAuth');
const { setRedisCache } = require('../config/redis');


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


// get user by email
const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error fetching user by email:', error);
        throw new AppError('Error fetching user', 500);
    }
};


// revoke token service
const revokeTokenService = async (token) => {
    try {
        const decoded = verifyJwtToken(token);
        if (!decoded) {
            throw new AppError('Invalid token', 401);
        }
        // hash token for verification
        const hashedToken = hashString(token);
        if (!hashedToken) {
            throw new AppError('An error occurred while hashing the token', 500);
        }
        // calculate expiry time for the token
        const ttl = Math.floor((decoded.exp - Date.now() / 1000) * 1000); // convert to milliseconds
        // store the hashed token in Redis with a TTL
        await setRedisCache(hashedToken, 'revoked', ttl);

        return true; // return true if token is revoked successfully
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error revoking token:', error);
        throw new AppError('Error revoking token', 500);
    }
};


// export functions
module.exports = {
    createUserService, getUserByEmail, revokeTokenService
};