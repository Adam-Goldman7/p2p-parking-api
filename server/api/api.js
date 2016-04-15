var router = require('express').Router();

router.use('/user', require('./user/userRoutes'));
router.use('/building', require('./building/buildingRoutes'));
router.use('/parking', require('./parking/parkingRoutes'));
router.use('/parked', require('./parked/parkedRoutes'));

module.exports = router;