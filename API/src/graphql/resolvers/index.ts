import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../../models/userModel';
import Session from '../../../models/sessionModel';
import Player from '../../../models/playerModel';
import Booking from '../../../models/bookingModel';
import Review from '../../../models/reviewModel';
import Family from '../../../models/familyModel';
import { validateEmail, validatePassword, sanitizeInput, validateObjectId, validateRequiredFields } from '../../utils/validation';
import crypto from 'crypto';
import StripeService from '../../services/stripeService';

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return user;
    },
    users: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }
      return await User.find({});
    },
    sessions: async (_: unknown, { limit = 100, offset = 0 }: { limit?: number; offset?: number }) => {
      const sessions = await Session.find({})
        .populate('trainers', 'name')
        .limit(limit)
        .skip(offset);
      
      const totalCount = await Session.countDocuments({});
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: sessions,
        totalCount,
        hasNextPage
      };
    },
    session: async (_: unknown, { id }: { id: string }) => {
      if (!validateObjectId(id)) {
        throw new Error('Invalid session ID format');
      }
      const session = await Session.findById(id).populate('trainers', 'name');
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    },
    sessionBySlug: async (_: unknown, { slug }: { slug: string }) => {
      if (!slug) {
        throw new Error('Slug is required');
      }
      const session = await Session.findOne({ slug }).populate('trainers', 'name');
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    },
    players: async () => {
      return {
        nodes: await Player.find({}),
        totalCount: await Player.countDocuments({})
      };
    },
    player: async (_: unknown, { id }: { id: string }) => {
      if (!validateObjectId(id)) {
        throw new Error('Invalid player ID format');
      }
      const player = await Player.findById(id);
      if (!player) {
        throw new Error('Player not found');
      }
      return player;
    },
    bookings: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Fetch user's bookings and populate session data
      const bookings = await Booking.find({ user: user._id })
        .populate('session')
        .populate('user', 'id name email');
      
      // Filter out any bookings with missing sessions
      const validBookings = bookings.filter(booking => booking.session);
      
      // Populate trainers for each session
      for (const booking of validBookings) {
        if (booking.session && (booking.session as any).trainers) {
          await (booking.session as any).populate('trainers', 'name');
        }
      }
      
      return validBookings;
    },
    reviews: async () => {
      return {
        nodes: await Review.find({}),
        totalCount: await Review.countDocuments({})
      };
    },
    family: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const family = await Family.findOne({ 
        $or: [
          { primaryContact: user._id },
          { members: user._id }
        ]
      }).populate('primaryContact').populate('members');
      
      return family;
    },
    familyMembers: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const family = await Family.findOne({ 
        $or: [
          { primaryContact: user._id },
          { members: user._id }
        ]
      });
      
      if (!family) {
        return [];
      }
      
      // Get all family members (both Users and Players)
      const users = await User.find({ familyId: family._id });
      const players = await Player.find({ familyId: family._id });
      
      const familyMembers = [
        ...users.map(user => ({
          id: user._id,
          name: user.name,
          type: 'User',
          isMinor: user.birthday ? new Date().getFullYear() - new Date(user.birthday).getFullYear() < 18 : false,
          email: user.email,
          photo: user.photo,
          birthDate: user.birthday ? user.birthday.toISOString() : null
        })),
        ...players.map(player => ({
          id: player._id,
          name: player.name,
          type: 'Player',
          isMinor: player.isMinor,
          email: null,
          photo: player.profImg,
          birthDate: player.birthDate.toISOString()
        }))
      ];
      
      return familyMembers;
    }
  },
  Session: {
    endDate: (parent: any) => {
      // Ensure endDate is never null - use the last startDate if endDate is missing
      if (parent.endDate) {
        return parent.endDate.toISOString ? parent.endDate.toISOString() : parent.endDate;
      }
      if (parent.startDates && parent.startDates.length > 0) {
        // Use the last startDate as a fallback
        const lastStartDate = parent.startDates[parent.startDates.length - 1];
        return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
      }
      // If no startDates either, use a default date
      return new Date().toISOString();
    },
    id: (parent: any) => parent._id || parent.id,
    // Map database 'image' field to GraphQL 'images' field
    images: (parent: any) => parent.image || [],
    // Map database 'image' field to GraphQL 'coverImage' field (use first image)
    coverImage: (parent: any) => parent.image && parent.image.length > 0 ? parent.image[0] : null,
    // Calculate available spots
    availableSpots: async (parent: any) => {
      const bookingCount = await Booking.countDocuments({ session: parent._id });
      return Math.max(0, parent.rosterLimit - bookingCount);
    },
    // Map database 'trainers' array to GraphQL 'trainer' string (use first trainer)
    trainer: (parent: any) => {
      if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
        // Find the first trainer (not admin)
        const firstTrainer = parent.trainers.find((trainer: any) => {
          if (typeof trainer === 'object' && trainer.name) {
            // Filter out admin users
            return !trainer.name.toLowerCase().includes('admin') && 
                   !trainer.name.toLowerCase().includes('test');
          }
          return false;
        });
        
        if (firstTrainer && typeof firstTrainer === 'object' && firstTrainer.name) {
          return firstTrainer.name;
        }
      }
      return null;
    },
    // Format startDates as ISO strings
    startDates: (parent: any) => {
      if (!parent.startDates || !Array.isArray(parent.startDates)) {
        return [];
      }
      return parent.startDates.map((date: any) => {
        if (date instanceof Date) {
          return date.toISOString();
        }
        if (typeof date === 'string') {
          return date;
        }
        return new Date(date).toISOString();
      });
    },
    createdAt: (parent: any) => {
      if (parent.createdAt) {
        return parent.createdAt.toISOString ? parent.createdAt.toISOString() : parent.createdAt;
      }
      // If no createdAt, use the first startDate as fallback
      if (parent.startDates && parent.startDates.length > 0) {
        const firstStartDate = parent.startDates[0];
        return firstStartDate.toISOString ? firstStartDate.toISOString() : firstStartDate;
      }
      // If no startDates either, use a default date
      return new Date().toISOString();
    },
    updatedAt: (parent: any) => {
      if (parent.updatedAt) {
        return parent.updatedAt.toISOString ? parent.updatedAt.toISOString() : parent.updatedAt;
      }
      // If no updatedAt, use the last startDate as fallback
      if (parent.startDates && parent.startDates.length > 0) {
        const lastStartDate = parent.startDates[parent.startDates.length - 1];
        return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
      }
      // If no startDates either, use a default date
      return new Date().toISOString();
    }
  },
  SessionSummary: {
    endDate: (parent: any) => {
      // Ensure endDate is never null - use the last startDate if endDate is missing
      if (parent.endDate) {
        return parent.endDate.toISOString ? parent.endDate.toISOString() : parent.endDate;
      }
      if (parent.startDates && parent.startDates.length > 0) {
        // Use the last startDate as a fallback
        const lastStartDate = parent.startDates[parent.startDates.length - 1];
        return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
      }
      // If no startDates either, use a default date
      return new Date().toISOString();
    },
    id: (parent: any) => parent._id || parent.id,
    // Map database 'image' field to GraphQL 'images' field
    images: (parent: any) => parent.image || [],
    // Map database 'image' field to GraphQL 'coverImage' field (use first image)
    coverImage: (parent: any) => parent.image && parent.image.length > 0 ? parent.image[0] : null,
    // Calculate available spots
    availableSpots: async (parent: any) => {
      const bookingCount = await Booking.countDocuments({ session: parent._id });
      return Math.max(0, parent.rosterLimit - bookingCount);
    },
    // Map database 'trainers' array to GraphQL 'trainer' string (use first trainer)
    trainer: (parent: any) => {
      if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
        // Find the first trainer (not admin)
        const firstTrainer = parent.trainers.find((trainer: any) => {
          if (typeof trainer === 'object' && trainer.name) {
            // Filter out admin users
            return !trainer.name.toLowerCase().includes('admin') && 
                   !trainer.name.toLowerCase().includes('test');
          }
          return false;
        });
        
        if (firstTrainer && typeof firstTrainer === 'object' && firstTrainer.name) {
          return firstTrainer.name;
        }
      }
      return null;
    },
    // Format startDates as ISO strings
    startDates: (parent: any) => {
      if (!parent.startDates || !Array.isArray(parent.startDates)) {
        return [];
      }
      return parent.startDates.map((date: any) => {
        if (date instanceof Date) {
          return date.toISOString();
        }
        if (typeof date === 'string') {
          return date;
        }
        return new Date(date).toISOString();
      });
    },
    createdAt: (parent: any) => {
      if (parent.createdAt) {
        return parent.createdAt.toISOString ? parent.createdAt.toISOString() : parent.createdAt;
      }
      // If no createdAt, use the first startDate as fallback
      if (parent.startDates && parent.startDates.length > 0) {
        const firstStartDate = parent.startDates[0];
        return firstStartDate.toISOString ? firstStartDate.toISOString() : firstStartDate;
      }
      // If no startDates either, use a default date
      return new Date().toISOString();
    },
    updatedAt: (parent: any) => {
      if (parent.updatedAt) {
        return parent.updatedAt.toISOString ? parent.updatedAt.toISOString() : parent.updatedAt;
      }
      // If no updatedAt, use the last startDate as fallback
      if (parent.startDates && parent.startDates.length > 0) {
        const lastStartDate = parent.startDates[parent.startDates.length - 1];
        return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
      }
      // If no startDates either, use a default date
      return new Date().toISOString();
    }
  },
  Booking: {
    id: (parent: any) => parent._id || parent.id,
    createdAt: (parent: any) => parent.createdAt?.toISOString ? parent.createdAt.toISOString() : parent.createdAt,
    session: async (parent: any) => {
      // If session is already populated (object), return it
      if (parent.session && typeof parent.session === 'object') {
        return parent.session;
      }
      
      // If session is not populated but we have a session ID (string/ObjectId), fetch it
      if (parent.session && typeof parent.session === 'string') {
        const session = await Session.findById(parent.session);
        if (!session) {
          throw new Error('Session not found for this booking');
        }
        return session;
      }
      
      // If no session reference, throw an error
      throw new Error('No session associated with this booking');
    }
  },
  Mutation: {
    signup: async (_: unknown, { input }: { input: any }) => {
      const { name, email, password, passwordConfirm } = input;
      
      // Input validation
      const missingFields = validateRequiredFields(input, ['name', 'email', 'password', 'passwordConfirm']);
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
      
      // Check if passwords match
      if (password !== passwordConfirm) {
        return {
          status: 'error',
          message: 'Passwords do not match',
          errors: [{ message: 'Passwords do not match', code: 'PASSWORD_MISMATCH', field: 'passwordConfirm' }]
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
        role: 'user' // Default role
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      return {
        status: 'success',
        message: 'User created successfully',
        token,
        data: user
      };
    },
    login: async (_: unknown, { input }: { input: any }) => {
      const { email, password } = input;

      // Input validation
      const missingFields = validateRequiredFields(input, ['email', 'password']);
      if (missingFields.length > 0) {
        return {
          status: 'error',
          message: 'Email and password are required',
          errors: [{ message: 'Email and password are required', code: 'MISSING_FIELDS' }]
        };
      }

      if (!validateEmail(email)) {
        return {
          status: 'error',
          message: 'Invalid email format',
          errors: [{ message: 'Invalid email format', code: 'INVALID_EMAIL', field: 'email' }]
        };
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return {
          status: 'error',
          message: 'Invalid credentials',
          errors: [{ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }]
        };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          status: 'error',
          message: 'Invalid credentials',
          errors: [{ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }]
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      return {
        status: 'success',
        message: 'Login successful',
        token,
        data: user
      };
    },
    createBooking: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { sessionId, price } = input;

      // Validate input
      if (!validateObjectId(sessionId)) {
        throw new Error('Invalid session ID format');
      }

      if (!price || price <= 0) {
        throw new Error('Invalid price');
      }

      // Check if session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if user already has a booking for this session
      const existingBooking = await Booking.findOne({
        user: user._id,
        session: sessionId
      });

      if (existingBooking) {
        throw new Error('You already have a booking for this session');
      }

      // Create booking
      const booking = new Booking({
        user: user._id,
        session: sessionId,
        price,
        paid: false
      });

      await booking.save();

      // Populate session and user data
      await booking.populate('session');
      await booking.populate('user');

      return booking;
    },
    createPaymentIntent: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { sessionId, price } = input;

      // Validate input
      if (!validateObjectId(sessionId)) {
        throw new Error('Invalid session ID format');
      }

      if (!price || price <= 0) {
        throw new Error('Invalid price');
      }

      // Check if session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if user already has a booking for this session
      const existingBooking = await Booking.findOne({
        user: user._id,
        session: sessionId
      });

      if (existingBooking) {
        throw new Error('You already have a booking for this session');
      }

      // Convert price to cents for Stripe
      const amountInCents = Math.round(price * 100);

      // Create payment intent
      const paymentIntent = await StripeService.createPaymentIntent({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          sessionId,
          userId: user._id.toString(),
          sessionName: session.name,
        },
        customerEmail: user.email,
      });

      return paymentIntent;
    },
    resetPassword: async (_: unknown, { token, password, passwordConfirm }: { token: string, password: string, passwordConfirm: string }) => {
      // Input validation
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
        // Find user by reset token
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

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.passwordChangedAt = new Date();

        await user.save();

        // Generate new JWT token
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
    forgotPassword: async (_: unknown, { email }: { email: string }) => {
      // Input validation
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
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          // Don't reveal if user exists or not for security
          return {
            status: 'success',
            message: 'If an account with that email exists, a password reset link has been sent.',
            errors: []
          };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set reset token and expiry (15 minutes)
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        // TODO: Send email with reset link
        // For now, just return success message
        console.log('Password reset token:', resetToken);

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
    }
  }
}; 