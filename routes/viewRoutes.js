const express = require('express');
router = express.Router();
controller = require('./../controllers/viewController');

router.get('/', controller.getBase);

router.get('/overview', controller.getOverview);

router.get('/tour', controller.getTour);

module.exports = router;
