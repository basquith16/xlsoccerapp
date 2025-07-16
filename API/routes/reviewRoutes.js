import express from 'express';
import { getAllReviews, getReview, createReview, updateReview, deleteReview, setTourUserIds } from '../controllers/reviewController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(protect);

router.route('/')
  .get(getAllReviews)
  .post(
    restrictTo('user'),
    setTourUserIds,
    createReview
  );

router.route('/:id')
  .get(getReview)
  .patch(
    restrictTo('user', 'admin'),
    updateReview
  )
  .delete(
    restrictTo('user', 'admin'),
    deleteReview
  );

export default router;