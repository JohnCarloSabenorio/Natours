"use strict";

var express = require('express');

var userController = require('./../controllers/userController');

var authController = require('./../controllers/authController'); // Using multer() without any options will store in image in memory


var router = express.Router(); // ROUTES
// Authentication route

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword); // All routes after this middleware needs authentication to be accessed

router.use(authController.protect);
router.route('/updateMyPassword').patch(authController.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);
router.route('/updateMe').patch(userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.route('/deleteMe')["delete"](userController.deleteMe); // All routes after this middleware is only for the admin

router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser)["delete"](userController.deleteUser);
module.exports = router;