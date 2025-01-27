const express = require('express');
router = express.Router();
controller = require('./../controllers/viewController');
authController = require('./../controllers/authController');

router.get('/me', authController.protect, controller.getAccount);

router.use(authController.isLoggedIn);
router.get('/', controller.getOverview);
router.get('/tour/:slug', controller.getTour);
router.post('/submit-user-data', authController.protect,controller.updateUserData);
router.get('/login', controller.getLoginForm);

module.exports = router;
