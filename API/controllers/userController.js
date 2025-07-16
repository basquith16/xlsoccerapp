import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import multer from 'multer';
import sharp from 'sharp';
import { getAll, getOne, updateOne, deleteOne } from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';

// Helper Functions
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image. Please upload only image files', 400), false);
    }
}
const upload = multer({
     storage: multerStorage,
     fileFilter: multerFilter
});

// Handlers
export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync( async(req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(200, 200)
        .toFormat('jpeg')
        .jpeg({quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

export const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

export const updateMe = catchAsync(async(req, res, next) => {

    // Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates, please use updateMyPassword', 400));
    }

    // Filter out unwanted fields -- wanted fields listed below
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators:true
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    }); 
});

export const deleteMe = catchAsync(async(req, res, next) => {
    // Deactivate Account
    await User.findByIdAndUpdate(req.user.id, { active: false });
    
    res.status(204).json({
        status: 'success',
        data: null
    }); 
});

// Factory Functions
export const getAllUsers = getAll(User);
export const getUser = getOne(User, {path: 'players'}, 'name birthYear teams');
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

