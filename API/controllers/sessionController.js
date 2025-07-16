import Session from '../models/sessionModel.js';
import AppError from '../utils/appError.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from './handlerFactory.js';
import multer from 'multer';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync.js';

// Helper Functions
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
export const uploadSessionPhotos = upload.fields([
    {name: 'image', maxCount: 1},
    {name: 'profileImages', maxCount: 3}
]);

export const resizeSessionPhotos = catchAsync( async(req, res, next) => {
    if (!req.files.image && !req.files.profileImages) return next();

    if (req.files.image) {
        req.body.image = `session-${req.params.id}-${Date.now()}-cover.jpeg`
        await sharp(req.files.image[0].buffer)
            .resize(233, 145)
            .toFormat('jpeg')
            .jpeg({quality: 100 })
            .toFile(`public/img/sessions/${req.body.image}`);
    }

    if (req.files.profileImages) {
        req.body.profileImages = [];
        await Promise.all(req.files.profileImages.map(async (file, i) => {
            const filename = `session-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

            await sharp(file.buffer)
            .resize(2018, 1404)
            .toFormat('jpeg')
            .jpeg({quality: 100 })
            .toFile(`public/img/sessions/${filename}`);

        req.body.profileImages.push(filename);
        }));
    }
    next();
});

// Functions found in handlerFactory.js
export const getAllSessions = getAll(Session, 'sessions');
export const getSession = getOne(Session, {path: 'roster'}, 'name birthYear');
export const getSessionBySlug = catchAsync(async (req, res, next) => {
    const session = await Session.findOne({ slug: req.params.slug }).populate('roster', 'name birthYear');
    
    if (!session) {
        return next(new AppError('No session found with that slug', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            session: session
        }
    });
});
export const addSession = createOne(Session);
export const updateSession = updateOne(Session);  
export const deleteSession = deleteOne(Session);