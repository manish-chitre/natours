const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');

router.route('/:id').get(reviewController.getReview);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// POST /reviews

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.addReview
  );

module.exports = router;
