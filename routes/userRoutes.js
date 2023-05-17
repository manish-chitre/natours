const express = require('express');const authController = require('../controllers/authController');

const router = express.Router();
const userController = require('../controllers/userController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

//protect all routes after this middleware.
router.use(authController.protect);

router.route('/updatePassword').patch(authController.updatePassword);

router.route('/deleteMe').delete(userController.deleteMe);

router.route('/updateMe').patch(userController.updateMe);

router.route('/me').get(userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);

module.exports = router;
