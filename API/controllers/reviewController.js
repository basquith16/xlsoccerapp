import Review from './../models/reviewModel.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from './handlerFactory.js';
// import catchAsync from './../utils/catchAsync';

export const setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.session) req.body.session = req.params.sessionId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

export const getAllReviews = getAll(Review);
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);