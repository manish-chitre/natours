const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.param('id', tourController.checkId);

router.param('id', (req, res, next, val) => {
  console.log(`${val} is valid id`);
  next();
});

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-economical')
  .get(tourController.Top5Economical, tourController.getAllTours);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getAllTours
  )
  .post(tourController.checkBody, tourController.CreateTour);

router
  .route('/:id')
  .get(tourController.getTour)
  //.patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
