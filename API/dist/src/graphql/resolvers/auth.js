import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../../../models/userModel.js';
import Email from '../../../utils/email.js';
export const authResolvers = {
    signup: async (_, { input }) => {
        const { name, email, password, passwordConfirm } = input;
        if (password !== passwordConfirm) {
            return {
                status: 'error',
                token: '',
                data: null,
                errors: [{ message: 'Passwords do not match', code: 'PASSWORD_MISMATCH', field: 'passwordConfirm' }]
            };
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return {
                status: 'error',
                token: '',
                data: null,
                errors: [{ message: 'User already exists', code: 'USER_EXISTS', field: 'email' }]
            };
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            waiverSigned: false
        });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '90d')
        });
        return {
            status: 'success',
            token,
            data: user,
            errors: []
        };
    },
    login: async (_, { input }) => {
        const { email, password } = input;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return {
                status: 'error',
                token: '',
                data: null,
                errors: [{ message: 'Invalid email or password', code: 'INVALID_CREDENTIALS', field: 'email' }]
            };
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '90d')
        });
        return {
            status: 'success',
            token,
            data: user,
            errors: []
        };
    },
    logout: () => {
        return 'Logged out successfully';
    },
    forgotPassword: async (_, { email }) => {
        const user = await User.findOne({ email });
        if (!user) {
            return {
                status: 'error',
                message: 'No user found with that email address',
                errors: [{ message: 'No user found with that email address', code: 'USER_NOT_FOUND', field: 'email' }]
            };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save({ validateBeforeSave: false });
        try {
            const resetURL = `${resetToken}`;
            const emailInstance = new Email(user, resetURL);
            await emailInstance.sendPasswordReset();
            return {
                status: 'success',
                message: 'Token sent to email!',
                errors: []
            };
        }
        catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return {
                status: 'error',
                message: 'There was an error sending the email. Try again later!',
                errors: [{ message: 'Email sending failed', code: 'EMAIL_ERROR', field: null }]
            };
        }
    },
    resetPassword: async (_, { token, password, passwordConfirm }) => {
        if (password !== passwordConfirm) {
            return {
                status: 'error',
                token: '',
                data: null,
                errors: [{ message: 'Passwords do not match', code: 'PASSWORD_MISMATCH', field: 'passwordConfirm' }]
            };
        }
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            return {
                status: 'error',
                token: '',
                data: null,
                errors: [{ message: 'Token is invalid or has expired', code: 'INVALID_TOKEN', field: 'token' }]
            };
        }
        user.password = await bcrypt.hash(password, 12);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '90d')
        });
        return {
            status: 'success',
            token: jwtToken,
            data: user,
            errors: []
        };
    },
    updatePassword: async (_, { currentPassword, newPassword, newPasswordConfirm }, { user }) => {
        if (!user)
            throw new Error('Not authenticated');
        if (newPassword !== newPasswordConfirm) {
            throw new Error('Passwords do not match');
        }
        const currentUser = await User.findById(user.id).select('+password');
        if (!currentUser || !(await bcrypt.compare(currentPassword, currentUser.password))) {
            throw new Error('Current password is incorrect');
        }
        currentUser.password = await bcrypt.hash(newPassword, 12);
        currentUser.passwordChangedAt = new Date(Date.now() - 1000);
        await currentUser.save();
        const token = jwt.sign({ id: currentUser._id }, process.env.JWT_SECRET, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '90d')
        });
        return {
            status: 'success',
            token,
            data: currentUser,
            errors: []
        };
    }
};
