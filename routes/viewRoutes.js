const express = require('express');
router = express.Router();
controller = require('./../controllers/viewController');

router.get('/', controller.getOverview);

// router.get('/overview', controller.getOverview);

router.get('/tour/:slug', controller.getTour);

router.get('/login', controller.getLoginForm);


module.exports = router;
