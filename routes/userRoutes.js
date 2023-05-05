const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();
const userController = require('../controllers/userController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);

router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createAllUsers);

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .post(userController.createUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
