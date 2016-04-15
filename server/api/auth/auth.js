var bcryptSync = require('bcrypt');
var logger = require('../../util/logger');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt')
var config = require('../../config/config');
var checkToken = expressJwt({ secret: config.secrets.jwt });
var User = require('../user/userModel');
var Building = require('../building/buildingModel');

module.exports = {
  signToken: signToken,
  decodeToken: decodeToken,
  isOwner: isOwner,
  isAdmin: isAdmin,
  isSystem: isSystem,
  getFreshUser: getFreshUser,
  verifyParkingBuilding: verifyParkingBuilding
}



function signToken(id) {
  return jwt.sign(
    {_id: id},
    config.secrets.jwt
  );
}

function decodeToken(req, res, next) {
  if (req.query && req.query.hasOwnProperty('access_token'))
    req.headers.authorization = 'Bearer ' + req.query.access_token;

  checkToken(req, res, next);
}

function isOwner(req, res, next) {
  if (req.user._id !== req.params.id)
    return res.status(401).send('Only the owner can do this operation!');

  next();
}

function isAdmin(req, res, next) {
  if (!req.user.isAdmin)
    return res.status(401).send("Only admins can do this operation!");

  next();
}

function isSystem(req, res, next) {
  if (req.headers.sys_password !== config.sys_password)
    return res.status(401).send("turn away slowly. No questions will b asked.");

  next();
}

function getFreshUser(req, res, next) {
  User.findById(req.user._id)
    .then(user => {
      if (!user)
        return res.status(401).send("token didn't match any user");

      req.user = user;
      next();
    })
    .catch(next);
}

function verifyParkingBuilding(req, res, next) {
  var parking = req.body;

  Building.findById(parking.buildingId)
    .select('+password')
    .then(building => {
      if (!building)
        return res.status(404).send("Building doesn't exist " + buildingId);

      var passwordMatch = bcryptSync.compareSync(parking.buildingPassword, building.password);
      if (!passwordMatch)
        return res.status(401).send("Wrong building password!");
      
      req.temp.building = building;
      next();
    })
    .catch(next);
}