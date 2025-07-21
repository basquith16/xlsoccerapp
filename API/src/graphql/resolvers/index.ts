import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/userModel.ts';
import Session from '../../models/sessionModel.ts';
import Player from '../../models/playerModel.ts';
import Booking from '../../models/bookingModel.ts';
import Review from '../../models/reviewModel.ts';
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
      
      // Get all players where the current user is the parent
      const familyPlayers = await Player.find({ parent: user._id });
      const playerIds = familyPlayers.map(player => player._id);
      
      // Fetch all bookings for all family members and populate data
      const bookings = await Booking.find({ 
        player: { $in: playerIds } // All bookings go through Player records now
      })
        .populate('session')
        .populate('user', 'id name email')
        .populate('player');
      
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
    // Family queries
    familyMembers: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      const players = await Player.find({ parent: user._id });
      return players;
    },

    // Billing queries
    customer: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const paymentMethods = await StripeService.getPaymentMethods(customer.id);

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          paymentMethods: paymentMethods.map(pm => ({
            id: pm.id,
            type: pm.type,
            card: pm.card ? {
              id: pm.card.fingerprint || `card_${pm.id}`,
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
              fingerprint: pm.card.fingerprint,
            } : null,
            billingDetails: pm.billing_details ? {
              id: `billing_${pm.id}`,
              name: pm.billing_details.name,
              email: pm.billing_details.email,
              address: pm.billing_details.address ? {
                line1: pm.billing_details.address.line1,
                line2: pm.billing_details.address.line2,
                city: pm.billing_details.address.city,
                state: pm.billing_details.address.state,
                postalCode: pm.billing_details.address.postal_code,
                country: pm.billing_details.address.country,
              } : null,
            } : null,
          })),
          defaultPaymentMethod: customer.invoice_settings?.default_payment_method ? {
            id: customer.invoice_settings.default_payment_method,
            type: 'card',
            // Note: We'd need to fetch the full payment method details here
            // For simplicity, we'll just return the ID
          } : null,
        };
      } catch (error) {
        console.error('Error fetching customer:', error);
        throw new Error('Failed to fetch customer information');
      }
    },

    transactions: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const transactions = await StripeService.getPaymentHistory(customer.id);
        return transactions;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transaction history');
      }
    },

    paymentMethods: async (_: unknown, __: unknown, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const paymentMethods = await StripeService.getPaymentMethods(customer.id);

        return paymentMethods.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            id: pm.card.fingerprint || `card_${pm.id}`,
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
            fingerprint: pm.card.fingerprint,
          } : null,
          billingDetails: pm.billing_details ? {
            id: `billing_${pm.id}`,
            name: pm.billing_details.name,
            email: pm.billing_details.email,
            address: pm.billing_details.address ? {
              line1: pm.billing_details.address.line1,
              line2: pm.billing_details.address.line2,
              city: pm.billing_details.address.city,
              state: pm.billing_details.address.state,
              postalCode: pm.billing_details.address.postal_code,
              country: pm.billing_details.address.country,
            } : null,
          } : null,
        }));
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw new Error('Failed to fetch payment methods');
      }
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
    // Backward compatibility: return birthYear if available
    birthYear: (parent: any) => parent.birthYear || null,
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
    // Backward compatibility: return birthYear if available
    birthYear: (parent: any) => parent.birthYear || null,
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
    },
    player: async (parent: any) => {
      // If player is already populated (object), return it
      if (parent.player && typeof parent.player === 'object') {
        return parent.player;
      }
      
      // If player is not populated but we have a player ID (string/ObjectId), fetch it
      if (parent.player && typeof parent.player === 'string') {
        const player = await Player.findById(parent.player);
        if (!player) {
          // For existing bookings without proper player references, return null instead of throwing
          console.warn(`Player not found for booking ${parent._id}, player ID: ${parent.player}`);
          return null;
        }
        return player;
      }
      
      // If no player reference, return null instead of throwing error
      console.warn(`No player reference for booking ${parent._id}`);
      return null;
    }
  },
  Player: {
    id: (parent: any) => parent._id || parent.id,
    birthDate: (parent: any) => parent.birthDate?.toISOString ? parent.birthDate.toISOString() : parent.birthDate,
  },
  User: {
    id: (parent: any) => parent._id || parent.id,
    birthday: (parent: any) => parent.birthday?.toISOString ? parent.birthday.toISOString() : parent.birthday,
  },
  Mutation: {
    signup: async (_: unknown, { input }: { input: any }) => {
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
      
      // Check if passwords match
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
        role: 'user' // Default role
      });

      try {
        await user.save();
        console.log('User saved successfully:', user._id);
      } catch (error) {
        console.error('Error saving user:', error);
        return {
          status: 'error',
          message: 'Failed to create user',
          errors: [{ message: 'Database error occurred', code: 'DATABASE_ERROR' }]
        };
      }

      console.log('Creating Player record...');
      
      // Create a Player record for the user so they can book sessions for themselves
      const player = new Player({
        name: sanitizedName,
        birthDate: birthDate,
        sex: 'male', // Default, can be updated later
        waiverSigned: false,
        isMinor: actualAge < 18,
        profImg: 'default.jpg',
        parent: user._id
      });

      try {
        await player.save();
        console.log('Player saved successfully:', player._id);
      } catch (error) {
        console.error('Error saving player:', error);
        // Don't fail the signup if player creation fails, just log it
        console.log('Player creation failed, but user was created');
      }

      console.log('Generating JWT token...');
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      console.log('Signup successful! Returning response...');
      
      return {
        status: 'success',
        message: 'User created successfully',
        token,
        data: user
      };
    },
    login: async (_: unknown, { input }: { input: any }) => {
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
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      console.log('Login successful for user:', user.email);

      return {
        status: 'success',
        token,
        data: user
      };
    },
    createBooking: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { sessionId, playerId, price } = input;

      // Validate input
      if (!validateObjectId(sessionId)) {
        throw new Error('Invalid session ID format');
      }

      if (!validateObjectId(playerId)) {
        throw new Error('Invalid player ID format');
      }

      if (!price || price <= 0) {
        throw new Error('Invalid price');
      }

      // Check if session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if player exists and belongs to the user
      const player = await Player.findById(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.parent.toString() !== user._id.toString()) {
        throw new Error('Player does not belong to you');
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
        player: playerId,
        price,
        paid: false
      });

      await booking.save();

      // Populate session, user, and player data
      await booking.populate('session');
      await booking.populate('user');
      await booking.populate('player');

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
    },
    addFamilyMember: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { name, birthDate, sex, isMinor } = input;

      // Create a Player for the family member
      const player = new Player({
        name,
        birthDate: new Date(birthDate),
        sex,
        parent: user._id,
        isMinor
      });

      await player.save();

      return {
        id: player._id,
        name: player.name,
        isMinor: player.isMinor,
        birthDate: player.birthDate.toISOString(),
        sex: player.sex,
        profImg: player.profImg
      };
    },
    removeFamilyMember: async (_: unknown, { memberId }: { memberId: string }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      if (!validateObjectId(memberId)) {
        throw new Error('Invalid member ID format');
      }

      // Find the player and ensure it belongs to the current user
      const player = await Player.findOne({ _id: memberId, parent: user._id });
      if (!player) {
        throw new Error('Family member not found');
      }

      await Player.findByIdAndDelete(memberId);

      return 'Family member removed successfully';
    },
    updateMe: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { name, email, photo } = input;

      // Validate email if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
        if (existingUser) {
          throw new Error('Email is already taken');
        }
      }

      // Validate photo if provided (should be a Cloudinary URL)
      if (photo !== undefined && photo !== null) {
        if (typeof photo !== 'string') {
          throw new Error('Photo must be a string');
        }
        if (!photo.startsWith('http') && !photo.startsWith('/img/')) {
          throw new Error('Invalid photo URL format');
        }
      }

      const updateData: any = {};
      if (name) {
        updateData.name = sanitizeInput(name);
      }
      if (email) {
        updateData.email = email.toLowerCase().trim();
      }
      if (photo !== undefined) {
        updateData.photo = photo; // Store Cloudinary URL or file path
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      return updatedUser;
    },

    // Billing mutations
    createSetupIntent: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const setupIntent = await StripeService.createSetupIntent(
          customer.id,
          input.returnUrl
        );

        return setupIntent;
      } catch (error) {
        console.error('Error creating setup intent:', error);
        throw new Error('Failed to create setup intent');
      }
    },

    attachPaymentMethod: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { paymentMethodId } = input;

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const paymentMethod = await StripeService.attachPaymentMethod(paymentMethodId, customer.id);

        return {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card ? {
            id: paymentMethod.card.fingerprint || `card_${paymentMethod.id}`,
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
            fingerprint: paymentMethod.card.fingerprint,
          } : null,
          billingDetails: paymentMethod.billing_details ? {
            id: `billing_${paymentMethod.id}`,
            name: paymentMethod.billing_details.name,
            email: paymentMethod.billing_details.email,
            address: paymentMethod.billing_details.address ? {
              line1: paymentMethod.billing_details.address.line1,
              line2: paymentMethod.billing_details.address.line2,
              city: paymentMethod.billing_details.address.city,
              state: paymentMethod.billing_details.address.state,
              postalCode: paymentMethod.billing_details.address.postal_code,
              country: paymentMethod.billing_details.address.country,
            } : null,
          } : null,
        };
      } catch (error) {
        console.error('Error attaching payment method:', error);
        throw new Error('Failed to attach payment method');
      }
    },

    detachPaymentMethod: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { paymentMethodId } = input;

      try {
        await StripeService.detachPaymentMethod(paymentMethodId);
        return 'Payment method removed successfully';
      } catch (error) {
        console.error('Error detaching payment method:', error);
        throw new Error('Failed to remove payment method');
      }
    },

    setDefaultPaymentMethod: async (_: unknown, { input }: { input: any }, { user }: { user: any }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { paymentMethodId } = input;

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const updatedCustomer = await StripeService.setDefaultPaymentMethod(customer.id, paymentMethodId);

        return {
          id: updatedCustomer.id,
          email: updatedCustomer.email,
          name: updatedCustomer.name,
          paymentMethods: [], // This would need to be populated separately
          defaultPaymentMethod: {
            id: paymentMethodId,
            type: 'card',
          },
        };
      } catch (error) {
        console.error('Error setting default payment method:', error);
        throw new Error('Failed to set default payment method');
      }
    }
  }
};

export default resolvers; 