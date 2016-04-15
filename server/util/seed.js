var deasync = require('deasync');
var _ = require('lodash');
var logger = require('./logger');
var config = require('../config/config');
var auth = require('../api/auth/auth');

// models
var Building = require('../api/building/buildingModel');
var User = require('../api/user/userModel');
var Parking = require('../api/parking/parkingModel');
var Parked = require('../api/parked/parkedModel');

// data
var seedData = require('./seed.json')
var buildings = seedData.buildings;
var users = seedData.users;
var parkings = seedData.parkings;
var parked = seedData.parked;

// init
logger.log(`Seeding ${config.env} DB ...`);


module.exports = run();

function run() {
  var ready;
  cleanDB()
    .then(createBuildings)
    .then(createUsers)
    .then(createParked)
    .then(createParkings)
    .then(logSeedEnd)
    .catch(logSeedError)
    .then(() => { ready = true });
  
  // make seed sync so test won't run before it is completed
  while(ready === undefined) {
    deasync.sleep(100);
  }
}

function cleanDB() {
  logger.log('Cleaning the DB ...');
  var promises = [Building, Parking, User, Parked]
    .map(model => model.remove().exec());
  return Promise.all(promises);
}

function createBuildings() {
  logger.log('Seeding buildings ...');
  var promises = buildings.map(b => Building.create(b));
  return Promise.all(promises);
}

function createUsers() {
  logger.log('Seeding users ...');
  var promises = users.map(p => User.create(p));
  return Promise.all(promises)
          .then(attachTokenToUsers)
}

function createParked() {
  logger.log('Seeding parked ...');
  prepareParked();
  var promises = parked.map(p => Parked.create(p));
  return Promise.all(promises);
}

function createParkings() {
  logger.log('Seeding parkings ...');
  prepareParkings();
  var promises = parkings.map(p => Parking.create(p));
  return Promise.all(promises);
}

function prepareParked() {
  parked = parked.map(p => {
    // p.until = Date.now() + 1000 * 60 * 30.5; // for triggering scheduler
    p.until = Date.now() + 1000 * 60 * 60 * 2;
    return p;
  })
}

function prepareParkings() {
  parkings[11].ownerBackAt = Date.now() + 1000 * 60 * 60 * 4;

  parkings = parkings.map(assignBuildingProperties)
                    .map(setAvailability);
  
  // simulate controller middleware
  function assignBuildingProperties(p) {
    var b = _.find(buildings, {_id: p.buildingId});
    p.price = b.price;
    p.address = b.address;
    p.location = b.location;
    return p;
  }                    
  
  function setAvailability(p) {
    if (p.availability) {
      // if defined and false, match time with building
      if (!p.availability.current) {
        p.availability.until = _.find(parked, {parkingId: p._id}).until;
      }
      else {
        // if defined and true, set for 4 hours
        p.availability.until = Date.now() + 1000 * 60 * 60 * 4;
      }
    } 
    return p;
  }

}

function getAvailability() {
  return { 
    current: true, 
    until: Date.now() + 1000 * 60 * 60 * Math.random() * 8
  }
}

function attachTokenToUsers() {
  users = users.map(u => {
    u.token = auth.signToken(u._id);
    return u;
  });
}

function logSeedEnd() {
  logger.log("Seeded DB!");
}

function logSeedError(err) {
  logger.error(err)
}