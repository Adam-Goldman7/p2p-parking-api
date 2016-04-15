var router = require('express').Router();
var auth = require('../auth/auth');
var controller = require('./parkingController');
var ParkingService = require('./parkingService');

router.route('/')
  .get(controller.get)
  .post(auth.decodeToken, addUserIdToBody, auth.verifyParkingBuilding, ParkingService.addBuildingProperties, ParkingService.makeFirstAdmin, controller.post);

router.route('/location')
  .get(controller.getByLocation)

router.route('/:id')
  .get(controller.getOne)
  .put(auth.decodeToken, ParkingService.isOwner, controller.put);

module.exports = router;

function addUserIdToBody(req, res, next) {
  req.body.userId = req.user._id;
  next();
}