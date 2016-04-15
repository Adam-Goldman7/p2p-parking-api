var jwt    = require('jsonwebtoken'),
  _        = require('lodash'),
  config   = require('../../config/config'),
  logger   = require('../../util/logger'),
  auth     = require('../auth/auth'),
  Parking  = require('./parkingModel'),
  Building = require('../building/buildingModel');


module.exports = {
  get: get,
  getOne: getOne,
  post: post,
  put: put,
  getByLocation: getByLocation
}


function get(req, res, next) {
  Parking.find()
    .then(parkings => res.json(parkings))
    .catch(next);
}

function getOne(req, res, next) {
  var id = req.params.id;
  Parking.findById(id)
    .then(parking => parking ? res.json(parking) : res.status(404).send("Parking doesn't exist"))
    .catch(next);
}

function post(req, res, next) {
  Parking.create(req.body)
    .then(parking => res.status(201).json(parking))
    .catch(next);
}

function put(req, res, next) {
  Parking.update({ _id: req.params.id}, {$set: req.body})
    .then(DBres => res.json(DBres))
    .catch(next);
}

function getByLocation(req, res, next) {
  var coords = [+req.query.lon, + req.query.lat];
  var maxDistance = req.query.max_distance || config.maxDistance;
  var until = Date.now() + +req.query.duration;

  query()
    .then(prepare)
    .then(parkings => res.json(parkings))
    .catch(next);

  function query() {
    return Parking.geoNear(
      { type: "Point", coordinates: coords },
      { spherical: true, query: {'availability.current':true, 'availability.until': {$gte: until} } }
    );
  }

  function prepare(response) {
    return  response.map(r => {
      var dis = r.dis;
      r = r.obj.toObject();
      r.dis = dis;
      return r;
    });
  }
}