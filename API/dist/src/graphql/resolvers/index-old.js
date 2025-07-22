import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/userModel';
import Session from '../../models/sessionModel';
import Player from '../../models/playerModel';
import Booking from '../../models/bookingModel';
import Review from '../../models/reviewModel';
import SessionTemplate from '../../models/sessionTemplateModel';
import SchedulePeriod from '../../models/schedulePeriodModel';
import SessionInstance from '../../models/sessionInstanceModel';
import { validateEmail, validatePassword, sanitizeInput, validateObjectId, validateRequiredFields } from '../../utils/validation';
import crypto from 'crypto';
import StripeService from '../../services/stripeService';
import mongoose from 'mongoose';
export const resolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            return user;
        },
        users: async (_, __, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized');
            }
            return await User.find({});
        },
        sessions: async (_, { limit = 100, offset = 0 }) => {
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
        adminSessions: async (_, { limit = 100, offset = 0 }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            // Admin can see all sessions, including staff-only ones
            // Use lean() to bypass middleware and get plain objects
            const sessions = await Session.find({})
                .populate('trainers', 'name')
                .lean()
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
        session: async (_, { id }) => {
            if (!validateObjectId(id)) {
                throw new Error('Invalid session ID format');
            }
            const session = await Session.findById(id).populate('trainers', 'name');
            if (!session) {
                throw new Error('Session not found');
            }
            return session;
        },
        sessionBySlug: async (_, { slug }) => {
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
        player: async (_, { id }) => {
            if (!validateObjectId(id)) {
                throw new Error('Invalid player ID format');
            }
            const player = await Player.findById(id);
            if (!player) {
                throw new Error('Player not found');
            }
            return player;
        },
        bookings: async (_, __, { user }) => {
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
                if (booking.session && booking.session.trainers) {
                    await booking.session.populate('trainers', 'name');
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
        familyMembers: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            const players = await Player.find({ parent: user._id });
            return players;
        },
        // Billing queries
        customer: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            try {
                const customer = await StripeService.getOrCreateCustomer(user._id.toString(), user.email, user.name);
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
            }
            catch (error) {
                console.error('Error fetching customer:', error);
                throw new Error('Failed to fetch customer information');
            }
        },
        transactions: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            try {
                const customer = await StripeService.getOrCreateCustomer(user._id.toString(), user.email, user.name);
                const transactions = await StripeService.getPaymentHistory(customer.id);
                return transactions;
            }
            catch (error) {
                console.error('Error fetching transactions:', error);
                throw new Error('Failed to fetch transaction history');
            }
        },
        paymentMethods: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            try {
                const customer = await StripeService.getOrCreateCustomer(user._id.toString(), user.email, user.name);
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
            }
            catch (error) {
                console.error('Error fetching payment methods:', error);
                throw new Error('Failed to fetch payment methods');
            }
        },
        // New Session Template + Schedule Periods + Instances queries
        sessionTemplates: async (_, { limit = 10, offset = 0 }) => {
            const templates = await SessionTemplate.find({ isActive: true })
                .populate('periods')
                .populate('instances')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionTemplate.countDocuments({ isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: templates,
                totalCount,
                hasNextPage
            };
        },
        sessionTemplate: async (_, { id }) => {
            if (!validateObjectId(id)) {
                throw new Error('Invalid session template ID format');
            }
            const template = await SessionTemplate.findById(id)
                .populate('periods')
                .populate('instances');
            if (!template) {
                throw new Error('Session template not found');
            }
            return template;
        },
        sessionTemplateBySlug: async (_, { slug }) => {
            if (!slug) {
                throw new Error('Slug is required');
            }
            const template = await SessionTemplate.findOne({ slug, isActive: true })
                .populate('periods')
                .populate('instances');
            if (!template) {
                throw new Error('Session template not found');
            }
            return template;
        },
        // Schedule Period queries
        schedulePeriods: async (_, { limit = 10, offset = 0 }) => {
            const periods = await SchedulePeriod.find({ isActive: true })
                .populate('templateInfo')
                .populate('instances')
                .limit(limit)
                .skip(offset);
            const totalCount = await SchedulePeriod.countDocuments({ isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: periods,
                totalCount,
                hasNextPage
            };
        },
        schedulePeriod: async (_, { id }) => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid period ID');
            }
            const period = await SchedulePeriod.findById(id)
                .populate('templateInfo')
                .populate('instances');
            if (!period) {
                throw new Error('Schedule period not found');
            }
            return period;
        },
        schedulePeriodsByTemplate: async (_, { templateId, limit = 10, offset = 0 }) => {
            if (!mongoose.Types.ObjectId.isValid(templateId)) {
                throw new Error('Invalid template ID');
            }
            const periods = await SchedulePeriod.find({ template: templateId, isActive: true })
                .populate('templateInfo')
                .populate('instances')
                .limit(limit)
                .skip(offset);
            const totalCount = await SchedulePeriod.countDocuments({ template: templateId, isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: periods,
                totalCount,
                hasNextPage
            };
        },
        // Session Instance queries
        sessionInstances: async (_, { limit = 10, offset = 0 }) => {
            const instances = await SessionInstance.find({ isActive: true })
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({ isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        },
        sessionInstance: async (_, { id }) => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid instance ID');
            }
            const instance = await SessionInstance.findById(id)
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo');
            if (!instance) {
                throw new Error('Session instance not found');
            }
            return instance;
        },
        sessionInstancesByPeriod: async (_, { periodId, limit = 10, offset = 0 }) => {
            if (!mongoose.Types.ObjectId.isValid(periodId)) {
                throw new Error('Invalid period ID');
            }
            const instances = await SessionInstance.find({ period: periodId, isActive: true })
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({ period: periodId, isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        },
        sessionInstancesByTemplate: async (_, { templateId, limit = 10, offset = 0 }) => {
            if (!mongoose.Types.ObjectId.isValid(templateId)) {
                throw new Error('Invalid template ID');
            }
            const instances = await SessionInstance.find({ template: templateId, isActive: true })
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({ template: templateId, isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        },
        // Admin queries for new structure
        adminSessionTemplates: async (_, { limit = 10, offset = 0 }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                const totalCount = await SessionTemplate.countDocuments();
                const templates = await SessionTemplate.find()
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit);
                return {
                    nodes: templates,
                    totalCount,
                    hasNextPage: offset + limit < totalCount,
                    hasPreviousPage: offset > 0
                };
            }
            catch (error) {
                console.error('Error fetching admin session templates:', error);
                throw new Error('Failed to fetch session templates');
            }
        },
        adminCoaches: async (_, __, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                // Get all users with coach role, including TBD
                const coaches = await User.find({
                    $or: [
                        { role: 'coach' },
                        { email: 'tbd@system.local' } // Include TBD user
                    ]
                }).sort({ name: 1 });
                return coaches;
            }
            catch (error) {
                console.error('Error fetching coaches:', error);
                throw new Error('Failed to fetch coaches');
            }
        },
        // Admin Schedule Period queries
        adminSchedulePeriods: async (_, { limit = 10, offset = 0 }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            const periods = await SchedulePeriod.find({})
                .populate('templateInfo')
                .populate('instances')
                .limit(limit)
                .skip(offset);
            const totalCount = await SchedulePeriod.countDocuments({});
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: periods,
                totalCount,
                hasNextPage
            };
        },
        // Admin Session Instance queries
        adminSessionInstances: async (_, { limit = 10, offset = 0 }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            const instances = await SessionInstance.find({})
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({});
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        }
    },
    Session: {
        isActive: (session) => {
            const now = new Date();
            const endDate = new Date(session.endDate);
            return now <= endDate;
        },
        isPubliclyVisible: (session) => {
            const now = new Date();
            const endDate = new Date(session.endDate);
            return now <= endDate;
        },
        endDate: (parent) => {
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
        id: (parent) => parent._id || parent.id,
        // Backward compatibility: return birthYear if available
        birthYear: (parent) => parent.birthYear || null,
        // Map database 'image' field to GraphQL 'images' field
        images: (parent) => parent.image || [],
        // Map database 'image' field to GraphQL 'coverImage' field (use first image)
        coverImage: (parent) => parent.image && parent.image.length > 0 ? parent.image[0] : null,
        // Calculate available spots
        availableSpots: async (parent) => {
            const bookingCount = await Booking.countDocuments({ session: parent._id });
            return Math.max(0, parent.rosterLimit - bookingCount);
        },
        // Map database 'trainers' array to GraphQL 'trainer' string (use first trainer)
        trainer: (parent) => {
            if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
                // Find the first trainer (not admin)
                const firstTrainer = parent.trainers.find((trainer) => {
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
        startDates: (parent) => {
            if (!parent.startDates || !Array.isArray(parent.startDates)) {
                return [];
            }
            return parent.startDates.map((date) => {
                if (date instanceof Date) {
                    return date.toISOString();
                }
                if (typeof date === 'string') {
                    return date;
                }
                return new Date(date).toISOString();
            });
        },
        createdAt: (parent) => {
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
        updatedAt: (parent) => {
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
        endDate: (parent) => {
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
        id: (parent) => parent._id || parent.id,
        // Backward compatibility: return birthYear if available
        birthYear: (parent) => parent.birthYear || null,
        // Map database 'image' field to GraphQL 'images' field
        images: (parent) => parent.image || [],
        // Map database 'image' field to GraphQL 'coverImage' field (use first image)
        coverImage: (parent) => parent.image && parent.image.length > 0 ? parent.image[0] : null,
        // Calculate available spots
        availableSpots: async (parent) => {
            const bookingCount = await Booking.countDocuments({ session: parent._id });
            return Math.max(0, parent.rosterLimit - bookingCount);
        },
        // Map database 'trainers' array to GraphQL 'trainer' string (use first trainer)
        trainer: (parent) => {
            if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
                // Find the first trainer (not admin)
                const firstTrainer = parent.trainers.find((trainer) => {
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
        startDates: (parent) => {
            if (!parent.startDates || !Array.isArray(parent.startDates)) {
                return [];
            }
            return parent.startDates.map((date) => {
                if (date instanceof Date) {
                    return date.toISOString();
                }
                if (typeof date === 'string') {
                    return date;
                }
                return new Date(date).toISOString();
            });
        },
        createdAt: (parent) => {
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
        updatedAt: (parent) => {
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
        id: (parent) => parent._id || parent.id,
        createdAt: (parent) => parent.createdAt?.toISOString ? parent.createdAt.toISOString() : parent.createdAt,
        session: async (parent) => {
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
        player: async (parent) => {
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
        id: (parent) => parent._id || parent.id,
        birthDate: (parent) => parent.birthDate?.toISOString ? parent.birthDate.toISOString() : parent.birthDate,
    },
    User: {
        id: (parent) => parent._id || parent.id,
        birthday: (parent) => parent.birthday?.toISOString ? parent.birthday.toISOString() : parent.birthday,
    },
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
            }
            catch (error) {
                console.error('Error saving player:', error);
                // Don't fail the signup if player creation fails, just log it
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
        createBooking: async (_, { input }, { user }) => {
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
        createPaymentIntent: async (_, { input }, { user }) => {
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
        resetPassword: async (_, { token, password, passwordConfirm }) => {
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
        },
        forgotPassword: async (_, { email }) => {
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
            }
            catch (error) {
                return {
                    status: 'error',
                    message: 'Failed to process password reset request',
                    errors: [{ message: 'Failed to process password reset request', code: 'RESET_REQUEST_FAILED' }]
                };
            }
        },
        addFamilyMember: async (_, { input }, { user }) => {
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
        removeFamilyMember: async (_, { memberId }, { user }) => {
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
        updateMe: async (_, { input }, { user }) => {
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
            const updateData = {};
            if (name) {
                updateData.name = sanitizeInput(name);
            }
            if (email) {
                updateData.email = email.toLowerCase().trim();
            }
            if (photo !== undefined) {
                updateData.photo = photo; // Store Cloudinary URL or file path
            }
            const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true, runValidators: true });
            if (!updatedUser) {
                throw new Error('Failed to update user');
            }
            return updatedUser;
        },
        // Billing mutations
        createSetupIntent: async (_, { input }, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            try {
                const customer = await StripeService.getOrCreateCustomer(user._id.toString(), user.email, user.name);
                const setupIntent = await StripeService.createSetupIntent(customer.id, input.returnUrl);
                return setupIntent;
            }
            catch (error) {
                console.error('Error creating setup intent:', error);
                throw new Error('Failed to create setup intent');
            }
        },
        attachPaymentMethod: async (_, { input }, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            const { paymentMethodId } = input;
            try {
                const customer = await StripeService.getOrCreateCustomer(user._id.toString(), user.email, user.name);
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
            }
            catch (error) {
                console.error('Error attaching payment method:', error);
                throw new Error('Failed to attach payment method');
            }
        },
        detachPaymentMethod: async (_, { input }, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            const { paymentMethodId } = input;
            try {
                await StripeService.detachPaymentMethod(paymentMethodId);
                return 'Payment method removed successfully';
            }
            catch (error) {
                console.error('Error detaching payment method:', error);
                throw new Error('Failed to remove payment method');
            }
        },
        setDefaultPaymentMethod: async (_, { input }, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            const { paymentMethodId } = input;
            try {
                const customer = await StripeService.getOrCreateCustomer(user._id.toString(), user.email, user.name);
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
            }
            catch (error) {
                console.error('Error setting default payment method:', error);
                throw new Error('Failed to set default payment method');
            }
        },
        // Session Management (Admin Only)
        createSession: async (_, { input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                const session = new Session(input);
                await session.save();
                // Log admin action
                console.log(`Admin ${user.email} created session: ${session.name} (ID: ${session._id})`);
                return session;
            }
            catch (error) {
                console.error('Error creating session:', error);
                throw new Error(error.message || 'Failed to create session');
            }
        },
        updateSession: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid session ID format');
            }
            try {
                const session = await Session.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true, runValidators: true });
                if (!session) {
                    throw new Error('Session not found');
                }
                // Log admin action
                console.log(`Admin ${user.email} updated session: ${session.name} (ID: ${session._id})`);
                return session;
            }
            catch (error) {
                console.error('Error updating session:', error);
                throw new Error(error.message || 'Failed to update session');
            }
        },
        deleteSession: async (_, { id }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid session ID format');
            }
            try {
                const session = await Session.findById(id);
                if (!session) {
                    throw new Error('Session not found');
                }
                // Check if session has bookings
                const bookingCount = await Booking.countDocuments({ session: id });
                if (bookingCount > 0) {
                    throw new Error(`Cannot delete session with ${bookingCount} existing bookings`);
                }
                await Session.findByIdAndDelete(id);
                // Log admin action
                console.log(`Admin ${user.email} deleted session: ${session.name} (ID: ${session._id})`);
                return 'Session deleted successfully';
            }
            catch (error) {
                console.error('Error deleting session:', error);
                throw new Error(error.message || 'Failed to delete session');
            }
        },
        // User Management (Admin Only)
        updateUser: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid user ID format');
            }
            try {
                const updatedUser = await User.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true, runValidators: true });
                if (!updatedUser) {
                    throw new Error('User not found');
                }
                // Log admin action
                console.log(`Admin ${user.email} updated user: ${updatedUser.email} (ID: ${updatedUser._id})`);
                return updatedUser;
            }
            catch (error) {
                console.error('Error updating user:', error);
                throw new Error(error.message || 'Failed to update user');
            }
        },
        deleteUser: async (_, { id }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid user ID format');
            }
            try {
                const userToDelete = await User.findById(id);
                if (!userToDelete) {
                    throw new Error('User not found');
                }
                // Prevent admin from deleting themselves
                if (userToDelete._id.toString() === user._id.toString()) {
                    throw new Error('Cannot delete your own account');
                }
                // Check if user has bookings
                const bookingCount = await Booking.countDocuments({ user: id });
                if (bookingCount > 0) {
                    throw new Error(`Cannot delete user with ${bookingCount} existing bookings`);
                }
                await User.findByIdAndDelete(id);
                // Log admin action
                console.log(`Admin ${user.email} deleted user: ${userToDelete.email} (ID: ${userToDelete._id})`);
                return 'User deleted successfully';
            }
            catch (error) {
                console.error('Error deleting user:', error);
                throw new Error(error.message || 'Failed to delete user');
            }
        },
        // Session Template + Schedule Periods + Instances mutations (Admin only)
        createSessionTemplate: async (_, { input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                const template = new SessionTemplate(input);
                const savedTemplate = await template.save();
                console.log(`Admin ${user.email} created session template: ${savedTemplate.name} (ID: ${savedTemplate._id})`);
                return savedTemplate;
            }
            catch (error) {
                console.error('Error creating session template:', error);
                throw new Error(error.message || 'Failed to create session template');
            }
        },
        updateSessionTemplate: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid session template ID format');
            }
            try {
                const template = await SessionTemplate.findByIdAndUpdate(id, input, { new: true });
                if (!template) {
                    throw new Error('Session template not found');
                }
                console.log(`Admin ${user.email} updated session template: ${template.name} (ID: ${template._id})`);
                return template;
            }
            catch (error) {
                console.error('Error updating session template:', error);
                throw new Error(error.message || 'Failed to update session template');
            }
        },
        deleteSessionTemplate: async (_, { id }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid session template ID format');
            }
            try {
                const template = await SessionTemplate.findByIdAndDelete(id);
                if (!template) {
                    throw new Error('Session template not found');
                }
                console.log(`Admin ${user.email} deleted session template: ${template.name} (ID: ${template._id})`);
                return 'Session template deleted successfully';
            }
            catch (error) {
                console.error('Error deleting session template:', error);
                throw new Error(error.message || 'Failed to delete session template');
            }
        },
        // Schedule Period mutations
        createSchedulePeriod: async (_, { input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                // Handle TBD coach - create or find TBD user
                let coachIds = input.coachIds || [];
                if (coachIds.includes('TBD')) {
                    // Find or create TBD user
                    let tbdUser = await User.findOne({ email: 'tbd@system.local' });
                    if (!tbdUser) {
                        tbdUser = await User.create({
                            name: 'TBD - To Be Determined',
                            email: 'tbd@system.local',
                            role: 'coach',
                            active: true,
                            waiverSigned: true,
                            joinedDate: new Date()
                        });
                    }
                    // Replace 'TBD' with actual TBD user ID
                    coachIds = coachIds.map(id => id === 'TBD' ? tbdUser._id.toString() : id);
                }
                // Map GraphQL input fields to model fields
                const periodData = {
                    template: input.templateId,
                    name: input.name,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    coaches: coachIds,
                    capacity: input.capacity,
                    isActive: input.isActive !== undefined ? input.isActive : true
                };
                const period = new SchedulePeriod(periodData);
                const savedPeriod = await period.save();
                console.log(`Admin ${user.email} created schedule period: ${savedPeriod.name} (ID: ${savedPeriod._id})`);
                return savedPeriod;
            }
            catch (error) {
                console.error('Error creating schedule period:', error);
                throw new Error(error.message || 'Failed to create schedule period');
            }
        },
        updateSchedulePeriod: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid schedule period ID format');
            }
            try {
                // Map GraphQL input fields to model fields
                const updateData = {};
                if (input.name !== undefined)
                    updateData.name = input.name;
                if (input.startDate !== undefined)
                    updateData.startDate = input.startDate;
                if (input.endDate !== undefined)
                    updateData.endDate = input.endDate;
                if (input.coachIds !== undefined)
                    updateData.coaches = input.coachIds.filter(id => id !== 'TBD'); // Filter out TBD values
                if (input.capacity !== undefined)
                    updateData.capacity = input.capacity;
                if (input.isActive !== undefined)
                    updateData.isActive = input.isActive;
                const period = await SchedulePeriod.findByIdAndUpdate(id, updateData, { new: true });
                if (!period) {
                    throw new Error('Schedule period not found');
                }
                console.log(`Admin ${user.email} updated schedule period: ${period.name} (ID: ${period._id})`);
                return period;
            }
            catch (error) {
                console.error('Error updating schedule period:', error);
                throw new Error(error.message || 'Failed to update schedule period');
            }
        },
        deleteSchedulePeriod: async (_, { id }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid schedule period ID format');
            }
            try {
                const period = await SchedulePeriod.findByIdAndDelete(id);
                if (!period) {
                    throw new Error('Schedule period not found');
                }
                console.log(`Admin ${user.email} deleted schedule period: ${period.name} (ID: ${period._id})`);
                return 'Schedule period deleted successfully';
            }
            catch (error) {
                console.error('Error deleting schedule period:', error);
                throw new Error(error.message || 'Failed to delete schedule period');
            }
        },
        // Session Instance mutations
        createSessionInstance: async (_, { input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                const instance = new SessionInstance(input);
                const savedInstance = await instance.save();
                console.log(`Admin ${user.email} created session instance: ${savedInstance.name} (ID: ${savedInstance._id})`);
                return savedInstance;
            }
            catch (error) {
                console.error('Error creating session instance:', error);
                throw new Error(error.message || 'Failed to create session instance');
            }
        },
        updateSessionInstance: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid session instance ID format');
            }
            try {
                const instance = await SessionInstance.findByIdAndUpdate(id, input, { new: true });
                if (!instance) {
                    throw new Error('Session instance not found');
                }
                console.log(`Admin ${user.email} updated session instance: ${instance.name} (ID: ${instance._id})`);
                return instance;
            }
            catch (error) {
                console.error('Error updating session instance:', error);
                throw new Error(error.message || 'Failed to update session instance');
            }
        },
        deleteSessionInstance: async (_, { id }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid session instance ID format');
            }
            try {
                const instance = await SessionInstance.findByIdAndDelete(id);
                if (!instance) {
                    throw new Error('Session instance not found');
                }
                console.log(`Admin ${user.email} deleted session instance: ${instance.name} (ID: ${instance._id})`);
                return 'Session instance deleted successfully';
            }
            catch (error) {
                console.error('Error deleting session instance:', error);
                throw new Error(error.message || 'Failed to delete session instance');
            }
        },
        generateInstancesFromPeriod: async (_, { periodId, startDate, endDate, daysOfWeek, startTime, endTime }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(periodId)) {
                throw new Error('Invalid period ID format');
            }
            try {
                // Find the period and template
                const period = await SchedulePeriod.findById(periodId).populate('template');
                if (!period) {
                    throw new Error('Schedule period not found');
                }
                const template = period.template;
                if (!template) {
                    throw new Error('Template not found for this period');
                }
                // Validate date range
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error('Invalid date format');
                }
                if (start >= end) {
                    throw new Error('Start date must be before end date');
                }
                // Validate time format
                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                    throw new Error('Invalid time format. Use HH:MM format');
                }
                // Validate days of week (0 = Sunday, 1 = Monday, etc.)
                const validDays = daysOfWeek.every(day => day >= 0 && day <= 6);
                if (!validDays || daysOfWeek.length === 0) {
                    throw new Error('Invalid days of week. Must be 0-6 (Sunday-Saturday)');
                }
                // Generate instances for each day in the range
                const instances = [];
                const currentDate = new Date(start);
                while (currentDate <= end) {
                    const dayOfWeek = currentDate.getDay();
                    if (daysOfWeek.includes(dayOfWeek)) {
                        // Create instance for this day
                        const instance = new SessionInstance({
                            period: periodId,
                            template: template._id,
                            name: `${template.name} - ${currentDate.toLocaleDateString()}`,
                            date: new Date(currentDate),
                            startTime,
                            endTime,
                            coaches: period.coaches,
                            capacity: period.capacity,
                            isActive: true
                        });
                        instances.push(instance);
                    }
                    // Move to next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                // Save all instances
                const savedInstances = await SessionInstance.insertMany(instances);
                console.log(`Admin ${user.email} generated ${savedInstances.length} session instances from period: ${period.name} (ID: ${period._id})`);
                return savedInstances;
            }
            catch (error) {
                console.error('Error generating instances from period:', error);
                throw new Error(error.message || 'Failed to generate instances from period');
            }
        }
    }
};
export default resolvers;
