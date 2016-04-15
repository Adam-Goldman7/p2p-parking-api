var _      = require('lodash'),
  config   = require('../../config/config'),
  logger   = require('../../util/logger'),
  Parking  = require('../parking/parkingModel'),
  Parked   = require('./parkedModel');


module.exports = {
  getOne: getOne,
  post: post,
  start: start,
  end: end
}

function getOne(req, res, next) {
  var id = req.params.id;
  Parked.findById(id)
    .then(parked => parked ? res.json(parked) : res.status(404).send("Parked doesn't exist"))
    .catch(next);
}

function post(req, res, next) {
  var parkingId = req.body.parkingId;
  var until = Date.now() + +req.body.duration;

  // todo: make sure parking is availble
  // search other parkings in the building if it's not
  // notify user if no availble parkings from the building
  Parking.update({_id: parkingId}, 
    { $set:{'availability.current':false, 'availability.until': until} })
    .then(createParked)
    .then(parked => res.status(201).json(parked))
    .catch(next);

  function createParked() {
    return Parked.create({ 
      parkingId: parkingId, 
      parkerId: req.user._id, 
      until: until 
    });
  }
}

function start(req, res, next) {
  var id = req.params.id;
  Parked.update({_id: id}, {$set: {status: "parking"}})
    .then(DBres => res.json(DBres))
    .catch(next);
}

function end(req, res, next) {
  var id = req.params.id;
  Parked.findByIdAndUpdate({_id: id}, {$set: {status: "parked"}})
    .then(getParking)
    .then(updateParking)
    .then(DBres => res.json(DBres))
    .catch(next);

  function getParking(parked) {
    return Parking.findById(parked.parkingId)
  }

  function updateParking(parking) {
    return Parking.update({_id: parking._id}, 
      { $set: { 'availability.current': true, 'availability.until': parking.ownerBackAt } })
  }
}