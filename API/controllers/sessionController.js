const Session = require('../models/sessionModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');


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
exports.uploadSessionPhotos = upload.fields([
    {name: 'image', maxCount: 1},
    {name: 'profileImages', maxCount: 3}
]);

exports.resizeSessionPhotos = catchAsync( async(req, res, next) => {
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
exports.getAllSessions = factory.getAll(Session);
exports.getSession = factory.getOne(Session, {path: 'roster'}, 'name birthYear');
exports.addSession = factory.createOne(Session);
exports.updateSession = factory.updateOne(Session);  
exports.deleteSession = factory.deleteOne(Session);