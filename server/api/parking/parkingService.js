var logger = require('../../util/logger');
var Building = require('../building/buildingModel');
var controller = require('./parkingController');
var Parking = require('./parkingModel');

var service = {
  addBuildingProperties: addBuildingProperties,
  makeFirstAdmin: makeFirstAdmin,
  isOwner: isOwner
}


module.exports = service;


function addBuildingProperties(req, res, next){
  var parking = req.body;
  var building = req.temp.building

  parking.address = building.address;
  parking.location = building.location;
  parking.price = building.price;

  next();
  
}

function makeFirstAdmin(req, res, next) {
  var parking = req.body;
  var building = req.temp.building;

  if (!building.adminId) {
    Building.update({ _id: parking.buildingId }, { $set: {adminId: parking.userId} }, function(err, DBres) {
      next();
    }, next);
  } else {
    next();
  }
}

function isOwner(req, res, next) {
  var userId = req.user._id;
  var parkingId = req.params.id;

  Parking.findById(parkingId)
    .then(function(parking) {
      if (!parking)
        return res.status(404).send("parking doesn't exist");

      if (userId != String(parking.userId))
        return res.status(401).send("only owner can perform this operation!");

      next();
    })
    .catch(next);
}