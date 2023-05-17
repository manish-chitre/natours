const express = require('express');const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');

router.use(authController.protect);

router.route('/:id').get(reviewController.getReview);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// POST /reviews

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
