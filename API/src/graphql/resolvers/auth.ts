import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../../models/userModel';
import Player from '../../models/playerModel';
import { validateEmail, validatePassword, sanitizeInput, validateRequiredFields } from '../../utils/validation';
import { IUser } from '../../types/models';
import { setHttpOnlyCookie, clearCookie } from '../../utils/cookies';

export const authResolvers = {
  Mutation: {
    signup: async (_: unknown, { input }: { input: any }, context: any) => {
      
      const { name, email, password, passwordConfirm, birthday } = input;
      
      // Input validation
      const missingFields = validateRequiredFields(input, ['name', 'email', 'password', 'passwordConfirm', 'birthday']);
      if (missingFields.length > 0) {
        return {
          status: 'error',
          message: 'All fields are required',
          errors: [{ message: 'All fields are required', code: 'MISSING_FIELDS' }]
        };
      }

      if (!validateEmail(email)) {
        return {
          status: 'error',
          message: 'Invalid email format',
          errors: [{ message: 'Invalid email format', code: 'INVALID_EMAIL', field: 'email' }]
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

      // Validate birthday
      const birthDate = new Date(birthday);
      if (isNaN(birthDate.getTime())) {
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
      
      if (actualAge < 13) {
        return {
          status: 'error',
          message: 'You must be at least 13 years old to register',
          errors: [{ message: 'You must be at least 13 years old to register', code: 'UNDERAGE', field: 'birthday' }]
        };
      }

      // Sanitize inputs
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await User.findOne({ email: sanitizedEmail });
      if (existingUser) {
        return {
          status: 'error',
          message: 'User already exists',
          errors: [{ message: 'User already exists', code: 'USER_EXISTS', field: 'email' }]
        };
      }

      // Create new user
      const user = new User({
        name: sanitizedName,
        email: sanitizedEmail,
        password,
        birthday: birthDate,
        role: input.role || 'user',
        active: input.active !== undefined ? input.active : true,
        waiverSigned: input.waiverSigned !== undefined ? input.waiverSigned : false
      });

      try {
        await user.save();
      } catch (error) {
        return {
          status: 'error',
          message: 'Failed to create user',
          errors: [{ message: 'Database error occurred', code: 'DATABASE_ERROR' }]
        };
      }

      // Create a Player record for the user
      const player = new Player({
        name: sanitizedName,
        birthDate: birthDate,
        sex: 'male',
        waiverSigned: input.waiverSigned !== undefined ? input.waiverSigned : false,
        isMinor: actualAge < 18,
        profImg: 'default.jpg',
        parent: user._id
      });

      try {
        await player.save();
      } catch (error) {
        // Player creation failed, but user was created - this is acceptable
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      // Set httpOnly cookie
      if (context.res) {
        setHttpOnlyCookie(context.res, 'jwt', token);
      }
      
      return {
        status: 'success',
        message: 'User created successfully',
        data: user
      };
    },

    login: async (_: unknown, { input }: { input: any }, context: any) => {
      const { email, password } = input;

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
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      // Set httpOnly cookie
      if (context.res) {
        setHttpOnlyCookie(context.res, 'jwt', token);
      }

      return {
        status: 'success',
        data: user
      };
    },

    forgotPassword: async (_: unknown, { email }: { email: string }) => {
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

        // Note: In production, send this token via email instead of logging
        // TODO: Implement email service to send reset link

        return {
          status: 'success',
          message: 'If an account with that email exists, a password reset link has been sent.',
          errors: []
        };
      } catch (error) {
        return {
          status: 'error',
          message: 'Failed to process password reset request',
          errors: [{ message: 'Failed to process password reset request', code: 'RESET_REQUEST_FAILED' }]
        };
      }
    },

    resetPassword: async (_: unknown, { token, password, passwordConfirm }: { token: string, password: string, passwordConfirm: string }) => {
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

        const newToken = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET!,
          { expiresIn: '30d' }
        );

        return {
          status: 'success',
          message: 'Password reset successful',
          token: newToken,
          data: user
        };
      } catch (error) {
        return {
          status: 'error',
          message: 'Failed to reset password',
          errors: [{ message: 'Failed to reset password', code: 'RESET_FAILED' }]
        };
      }
    },

    logout: async (_: unknown, __: any, context: any) => {
      // Clear the httpOnly cookie
      if (context.res) {
        clearCookie(context.res, 'jwt');
      }

      return {
        status: 'success',
        message: 'Logged out successfully'
      };
    }
  }
}; 