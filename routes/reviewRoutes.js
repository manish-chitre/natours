const express = require('express');

const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.route('/:id').get(reviewController.getReview);

router
  .route('/')
  .get(reviewController.getReviews)
  .post(reviewController.addReview);

module.exports = router;
