const { AppError } = require('../utils/error');
const { createUserService, getUserByEmail, revokeTokenService, updateUserAccount,
    deleteUserAccountService
 } = require('../services/authService');
const { validateEmail, validateGender, validatePassword, validatePhone } = require('../utils/validators');
const { hashPassword, verifyPassword } = require('../utils/hashPassword');
const { createJwtToken, verifyJwtToken } = require('../utils/jwtAuth');
const { generateResetPasswordTemplate } = require('../templates/resetPassword');
const { addEmailJob } = require('../jobs/email/queue');


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
            email: email.toLowerCase(), // store email in lowercase
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
            token = createJwtToken( user.toObject(), '1d'); // token valid for 1 day
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
                address: user.address || {},
                role: user.role || 'user' // default role is 'user'
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
        const user = await getUserByEmail(email.toLowerCase());
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
            token = createJwtToken(user.toObject(), '1d'); // token valid for 1 day
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
                address: user.address || {},
                role: user.role || 'user' // default role is 'user'
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


// logout user controller
const logoutUserController = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        // clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict' // Prevent CSRF attacks
        });

        // revoke the token in Redis cache
        const isRevoked = await revokeTokenService(token);
        if (!isRevoked) {
            return next(new AppError('Failed to revoke token', 500));
        }
        return res.status(200).json({
            status: "success",
            message: "User logged out successfully"
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in logoutUserController:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// forgot password controller
const forgotPasswordController = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new AppError('Email is required', 400));
        }

        // validate email
        if (!validateEmail(email)) {
            return next(new AppError('Invalid email address', 400));
        }

        // get user by email
        const user = await getUserByEmail(email.toLowerCase());
        if (user) {
            // create reset token
            const resetToken = createJwtToken({ email: user.email, id: user._id }, '10m'); // token valid for 10 minutes
            if (!resetToken) {
                return next(new AppError('Failed to create reset token', 500));
            }
            // send reset email
            const resetUrl = `${process.env.FRONTEND_URL}/api/auth/user/password/reset?token=${resetToken}`;
            const emailData = {
                to: user.email,
                subject: 'Password Reset Request',
                from: "noreply@thebigphotocontest.com",
                text: 'You requested a password reset. Click the link below to reset your password:',
                html: generateResetPasswordTemplate(resetUrl, user.firstname)
            };
            // add email job to queue
            await addEmailJob(emailData);
        }
        // respond with success message
        return res.status(200).json({
            status: "success",
            message: "If this email is registered, you will receive a password reset link shortly."
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in forgotPasswordController:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// reset password controller
const resetPasswordController = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) {
            return next(new AppError('Reset token is required', 400));
        }

        const { password, confirmPassword } = req.body;
        if (!password || !validatePassword(password)) {
            return next(new AppError('Invalid password', 400));
        }
        if (password !== confirmPassword) {
            return next(new AppError('Passwords do not match', 400));
        }

        // verify reset token
        let decoded;
        try {
            decoded = verifyJwtToken(token);
        } catch (err) {
            console.error('JWT verification error:', err);
            return next(new AppError('Invalid reset token', 401));
        }

        // get user by email
        const user = await getUserByEmail(decoded.email);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // hash new password
        const hashedPassword = await hashPassword(password);

        // update user password
        const updatedUser = await updateUserAccount(user.email, { password: hashedPassword });
        if (!updatedUser) {
            return next(new AppError('Failed to update password', 500));
        }

        // revpoke the reset token
        const isRevoked = await revokeTokenService(token);
        if (!isRevoked) {
            return next(new AppError('Failed to revoke reset token', 500));
        }

        return res.status(200).json({
            status: "success",
            message: "Password reset successfully. You can now log in with your new password."
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in resetPasswordController:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// update user account controller
const updateUserAccountController = async (req, res, next) => {
    try {
        const user = req.user; // user is attached to request object by auth middleware
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const updateData = req.body;
        // validate input
        if (updateData.role) {
            return next(new AppError("Cannot update role, forbidden action", 403));
        }
        if (updateData.email) {
            return next(new AppError('Cannot update email', 400));
        }
        if (updateData.phone && !validatePhone(updateData.phone)) {
            return next(new AppError('Invalid phone number', 400));
        }
        if (updateData.gender && !validateGender(updateData.gender)) {
            return next(new AppError("Gender must either be male or female", 400));
        }
        if (updateData.password && !validatePassword(updateData.password)) {
            return next(new AppError('Password must be 8 characters long, contain a lower case, upper case,a number and a special characters', 400));
        }
        // verify old password, if password is being updated
        if (updateData.password && updateData.oldPassword) {
            const isPasswordValid = await verifyPassword(updateData.oldPassword, user.password);
            if (!isPasswordValid) {
                return next(new AppError('Invalid old password', 401));
            }
            const hashedPassword = await hashPassword(updateData.password);
            if (!hashedPassword) {
                return next(new AppError("An error occured while updating password, try again later", 500));
            }
            updateData.password = hashedPassword;
        }

        // update user account
        const updatedUser = await updateUserAccount(user.email, updateData);
        if (!updatedUser) {
            return next(new AppError('Failed to update user account', 500));
        }
        // delete password from response
        updatedUser.password = undefined;

        return res.status(200). json({
            status: "success",
            message: "User account updated successfully",
            user: updatedUser.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in updateUserAccountController:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// delete user account controller
const deleteUserAccountController = async (req, res, next) => {
    try {
        const user = req.user; // user is attached to request object by auth middleware
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // delete user account
        const result = await deleteUserAccountService(user.email);
        if (!result.deleted) {
            return next(new AppError('Failed to delete user account', 500));
        }

        // revoke all tokens associated with the user
        const token = req.cookies.token;
        try {
            const isRevoked = await revokeTokenService(token);
            if (!isRevoked) {
                console.error('Failed to revoke token');
            }
        } catch (err) {
            console.error('Error revoking token:', err);
        }

        // clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict' // Prevent CSRF attacks
        });

        return res.status(200).json({
            status: "success",
            message: "User account deleted successfully"
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in deleteUserAccountController:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// create admin account
const createAdminAccountController = async (req, res, next) => {
    try {
        const adminData = {
           firstname: "Charles",
           lastname: "Okechukwu",
           email: process.env.ADMIN_EMAIL.toLowerCase(), // store email in lowercase
           phone: process.env.ADMIN_PHONE,
           role: "admin"
        };

        // validate admin email
        if (!adminData.email || !validateEmail(adminData.email)) {
            return next(new AppError('Invalid admin email address', 400));
        }

        // validate admin phone
        if (!adminData.phone || !validatePhone(adminData.phone)) {
            return next(new AppError('Invalid admin phone number', 400));
        }

        // check if admin already exists
        const existingAdmin = await getUserByEmail(adminData.email, false); // do not throw error if user not found
        if (existingAdmin) {
            return next(new AppError('Admin account already exists', 400));
        }

        // hash default password
        const password = process.env.ADMIN_PASSWORD || null;
        if (!password || !validatePassword(password)) {
            return next(new AppError('Invalid admin password', 400));
        }

        const hashedPassword = await hashPassword(password);
        if (!hashedPassword) {
            return next(new AppError('Failed to hash admin password', 500));
        }
        adminData.password = hashedPassword;

        // create admin user
        const adminUser = await createUserService(adminData);
        if (!adminUser) {
            return next(new AppError('Failed to create admin account', 500));
        }

        // delete password field
        adminUser.password = undefined;

        return res.status(201).json({
            status: "success",
            message: "Admin account created successfully",
            user: adminUser.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        console.error('Error in createAdminAccountController:', error);
        return next(new AppError('Internal server error', 500));
    }
};

// export functions
module.exports = {
    createUserController, loginUserController, logoutUserController, forgotPasswordController,
    resetPasswordController, updateUserAccountController, deleteUserAccountController, createAdminAccountController,
};