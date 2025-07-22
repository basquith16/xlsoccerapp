import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../../models/userModel';
import Player from '../../models/playerModel';
import { validateEmail, validatePassword, sanitizeInput, validateRequiredFields } from '../../utils/validation';
export const authResolvers = {
    Mutation: {
        signup: async (_, { input }) => {
            console.log('=== SIGNUP ATTEMPT ===');
            console.log('Input received:', JSON.stringify(input, null, 2));
            const { name, email, password, passwordConfirm, birthday } = input;
            // Input validation
            const missingFields = validateRequiredFields(input, ['name', 'email', 'password', 'passwordConfirm', 'birthday']);
            if (missingFields.length > 0) {
                console.log('Missing fields:', missingFields);
                return {
                    status: 'error',
                    message: 'All fields are required',
                    errors: [{ message: 'All fields are required', code: 'MISSING_FIELDS' }]
                };
            }
            if (!validateEmail(email)) {
                console.log('Invalid email format:', email);
                return {
                    status: 'error',
                    message: 'Invalid email format',
                    errors: [{ message: 'Invalid email format', code: 'INVALID_EMAIL', field: 'email' }]
                };
            }
            if (!validatePassword(password)) {
                console.log('Weak password');
                return {
                    status: 'error',
                    message: 'Password must be at least 8 characters long',
                    errors: [{ message: 'Password must be at least 8 characters long', code: 'WEAK_PASSWORD', field: 'password' }]
                };
            }
            if (password !== passwordConfirm) {
                console.log('Passwords do not match');
                return {
                    status: 'error',
                    message: 'Passwords do not match',
                    errors: [{ message: 'Passwords do not match', code: 'PASSWORD_MISMATCH', field: 'passwordConfirm' }]
                };
            }
            // Validate birthday
            const birthDate = new Date(birthday);
            if (isNaN(birthDate.getTime())) {
                console.log('Invalid birthday format:', birthday);
                return {
                    status: 'error',
                    message: 'Invalid birthday format',
                    errors: [{ message: 'Invalid birthday format', code: 'INVALID_BIRTHDAY', field: 'birthday' }]
                };
            }
            // Check age requirement (must be at least 13)
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
            console.log('Age calculation:', { birthDate, actualAge });
            if (actualAge < 13) {
                console.log('User too young:', actualAge);
                return {
                    status: 'error',
                    message: 'You must be at least 13 years old to register',
                    errors: [{ message: 'You must be at least 13 years old to register', code: 'UNDERAGE', field: 'birthday' }]
                };
            }
            // Sanitize inputs
            const sanitizedName = sanitizeInput(name);
            const sanitizedEmail = email.toLowerCase().trim();
            console.log('Sanitized inputs:', { sanitizedName, sanitizedEmail });
            // Check if user already exists
            const existingUser = await User.findOne({ email: sanitizedEmail });
            if (existingUser) {
                console.log('User already exists:', sanitizedEmail);
                return {
                    status: 'error',
                    message: 'User already exists',
                    errors: [{ message: 'User already exists', code: 'USER_EXISTS', field: 'email' }]
                };
            }
            console.log('Creating new user...');
            // Create new user
            const user = new User({
                name: sanitizedName,
                email: sanitizedEmail,
                password,
                birthday: birthDate,
                role: 'user'
            });
            try {
                await user.save();
                console.log('User saved successfully:', user._id);
            }
            catch (error) {
                console.error('Error saving user:', error);
                return {
                    status: 'error',
                    message: 'Failed to create user',
                    errors: [{ message: 'Database error occurred', code: 'DATABASE_ERROR' }]
                };
            }
            console.log('Creating Player record...');
            // Create a Player record for the user
            const player = new Player({
                name: sanitizedName,
                birthDate: birthDate,
                sex: 'male',
                waiverSigned: false,
                isMinor: actualAge < 18,
                profImg: 'default.jpg',
                parent: user._id
            });
            try {
                await player.save();
                console.log('Player saved successfully:', player._id);
            }
            catch (error) {
                console.error('Error saving player:', error);
                console.log('Player creation failed, but user was created');
            }
            console.log('Generating JWT token...');
            // Generate JWT token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            console.log('Signup successful! Returning response...');
            return {
                status: 'success',
                message: 'User created successfully',
                token,
                data: user
            };
        },
        login: async (_, { input }) => {
            const { email, password } = input;
            console.log('Login attempt for email:', email);
            // Input validation
            const missingFields = validateRequiredFields(input, ['email', 'password']);
            if (missingFields.length > 0) {
                throw new Error('Email and password are required');
            }
            if (!validateEmail(email)) {
                throw new Error('Invalid email format');
            }
            // Find user
            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
            console.log('User found:', user ? 'Yes' : 'No');
            if (!user) {
                throw new Error('Invalid credentials');
            }
            console.log('User email in DB:', user.email);
            console.log('Password field exists:', !!user.password);
            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isPasswordValid);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            // Generate JWT token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            console.log('Login successful for user:', user.email);
            return {
                status: 'success',
                token,
                data: user
            };
        },
        forgotPassword: async (_, { email }) => {
            if (!email) {
                return {
                    status: 'error',
                    message: 'Email is required',
                    errors: [{ message: 'Email is required', code: 'MISSING_EMAIL' }]
                };
            }
            if (!validateEmail(email)) {
                return {
                    status: 'error',
                    message: 'Invalid email format',
                    errors: [{ message: 'Invalid email format', code: 'INVALID_EMAIL', field: 'email' }]
                };
            }
            try {
                const user = await User.findOne({ email: email.toLowerCase() });
                if (!user) {
                    return {
                        status: 'success',
                        message: 'If an account with that email exists, a password reset link has been sent.',
                        errors: []
                    };
                }
                // Generate reset token
                const resetToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
                user.passwordResetToken = hashedToken;
                user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
                await user.save();
                console.log('Password reset token:', resetToken);
                return {
                    status: 'success',
                    message: 'If an account with that email exists, a password reset link has been sent.',
                    errors: []
                };
            }
            catch (error) {
                return {
                    status: 'error',
                    message: 'Failed to process password reset request',
                    errors: [{ message: 'Failed to process password reset request', code: 'RESET_REQUEST_FAILED' }]
                };
            }
        },
        resetPassword: async (_, { token, password, passwordConfirm }) => {
            if (!token) {
                return {
                    status: 'error',
                    message: 'Reset token is required',
                    errors: [{ message: 'Reset token is required', code: 'MISSING_TOKEN' }]
                };
            }
            if (!password || !passwordConfirm) {
                return {
                    status: 'error',
                    message: 'Password and confirmation are required',
                    errors: [{ message: 'Password and confirmation are required', code: 'MISSING_PASSWORD' }]
                };
            }
            if (!validatePassword(password)) {
                return {
                    status: 'error',
                    message: 'Password must be at least 8 characters long',
                    errors: [{ message: 'Password must be at least 8 characters long', code: 'WEAK_PASSWORD', field: 'password' }]
                };
            }
            if (password !== passwordConfirm) {
                return {
                    status: 'error',
                    message: 'Passwords do not match',
                    errors: [{ message: 'Passwords do not match', code: 'PASSWORD_MISMATCH', field: 'passwordConfirm' }]
                };
            }
            try {
                const user = await User.findOne({
                    passwordResetToken: token,
                    passwordResetExpires: { $gt: Date.now() }
                });
                if (!user) {
                    return {
                        status: 'error',
                        message: 'Invalid or expired reset token',
                        errors: [{ message: 'Invalid or expired reset token', code: 'INVALID_TOKEN' }]
                    };
                }
                user.password = password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                user.passwordChangedAt = new Date();
                await user.save();
                const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
                return {
                    status: 'success',
                    message: 'Password reset successful',
                    token: newToken,
                    data: user
                };
            }
            catch (error) {
                return {
                    status: 'error',
                    message: 'Failed to reset password',
                    errors: [{ message: 'Failed to reset password', code: 'RESET_FAILED' }]
                };
            }
        }
    }
};
