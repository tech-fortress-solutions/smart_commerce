const { AppError } = require('../utils/error');
const { createUserService, getUserByEmail } = require('../services/authService');
const { validateEmail, validateGender, validatePassword, validatePhone } = require('../utils/validators');
const { hashPassword, verifyPassword } = require('../utils/hashPassword');
const { createJwtToken, verifyJwtToken } = require('../utils/jwtAuth');


// create user controller
const createUserController = async (req, res, next) => {
    try {
        const { email, password, confirmPassword,
            firstname, lastname, phone
        } = req.body;

        // validate input
        if (!firstname || !lastname) {
            return next(new AppError('First name and last name are required', 400));
        }

        if (!email || !validateEmail(email)) {
            return next(new AppError('Invalid email address', 400));
        }

        if (!password || !validatePassword(password)) {
            return next(new AppError('Invalid password', 400));
        }

        if (password !== confirmPassword) {
            return next(new AppError('Passwords do not match', 400));
        }
        if (!phone || !validatePhone(phone)) {
            return next(new AppError('Invalid phone number', 400));
        }

        // hash password
        const hashedPassword = await hashPassword(password);

        // create user
        const user = await createUserService({
            email,
            password: hashedPassword,
            firstname,
            lastname,
            phone
        });

        if (!user) {
            return next(new AppError('User creation failed', 500));
        }

        // create JWT token
        let token;
        try {
            token = createJwtToken( user.toObject());
        } catch (err) {
            return next(new AppError('Failed to create JWT token', 500));
        }

        // set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict', // Prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstname,
                lastName: user.lastname,
                phone: user.phone,
                address: user.address || {}
            }
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in createUserController:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// login user controller
const loginUserController = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // validate input
        if (!email || !validateEmail(email)) {
            return next(new AppError('Invalid email address', 400));
        }
        if (!password || !validatePassword(password)) {
            return next(new AppError('Invalid password', 400));
        }

        // get user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return next(new AppError('Invalid password', 401));
        }
        // create JWT token
        let token;
        try {
            token = createJwtToken(user.toObject());
        }
        catch (err) {
            return next(new AppError('Failed to create JWT token', 500));
        }
        // set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict', // Prevent CSRF attacks
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        return res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstname,
                lastName: user.lastname,
                phone: user.phone,
                address: user.address || {}
            }
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in loginUserController:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// export functions
module.exports = {
    createUserController, loginUserController
};