// spies = require('chai-spies');
var chai = require('chai');
// chai.use(spies);
var sinon = require('sinon');
var expect = chai.expect;
var request = require('supertest-as-promised');
var server = require('../../server.js');
var app = request(server);
var logger = require('../../util/logger');
var config = require('../../config/config');

var seedData = require('../../util/seed.json');
var seedBuildings = seedData.buildings;
var seedParkings = seedData.parkings;
var seedUsers = seedData.users;
var seedParked = seedData.parked;
var ParkedSchedule = require('./parkedSchedule');
var schedule = require('node-schedule');

describe('[PARKED]', () => {
  // var spy = chai.spy.on(schedule, 'scheduleJob');2
  var spySchedule = sinon.spy(schedule, "scheduleJob");
  var BASE_URL = '/api/parked';

  beforeEach('reset schedule spy', () => spySchedule.reset());

  it('should post parked and book a parking', done => {
      var user = seedUsers[15];
      var parking = seedParkings[4];
      var duration = 1000 * 60 * 60 * 2;
      var until = Date.now() + duration;
      var allowedDevation = 1000 * 3; // between the request and response
      var parked;

      app
        .post(BASE_URL)
        .set('Authorization', 'Bearer ' + user.token)
        .send({ duration: duration, parkingId: parking._id })
        .expect(201)
        .then(resp => {
          parked = resp.body;
          expect(parked.parkingId).to.equal(parking._id);
          expect(parked.parkerId).to.equal(user._id);
          expect(parked.until).to.be.closeTo(until, allowedDevation);

          // hook: post save: schedule
          expect(spySchedule.called).to.be.true;
          var ETA = spySchedule.getCall(0).args[0];
          expect(ETA).to.be.closeTo(Date.now() + 1000 * 60 * 15, allowedDevation);
          expect(ParkedSchedule.bookingEnds[parked._id]).to.not.be.undeinfed;

          return app
                  .get(`/api/parking/${parking._id}`);
        })
        .then(resp => {
          expect(resp.body.availability.current).to.equal(false);
          expect(resp.body.availability.until).to.be.closeTo(until, allowedDevation);
          done();
        });

    });

    it('should start a booked parking', done => {
      var user = seedUsers[16];
      var parking = seedParkings[5];
      var parked = seedParked[0];
      app
        .put(`${BASE_URL}/${parked._id}/start`)
        .set('Authorization', 'Bearer ' + user.token)
        .send()
        .then(resp => {
          expect(resp.body.ok).to.equal(1);
          return app
                  .get(`${BASE_URL}/${parked._id}`)
                  .set('sys_password', config.sys_password)
        })
        .then(resp => {
          expect(resp.body.status).to.equal("parking");
          done();
        });
    });

    it('should end an active parking', done => {
      var user = seedUsers[17];
      var parking = seedParkings[11];
      var parked = seedParked[1];
      app
        .put(`${BASE_URL}/${parked._id}/end`)
        .set('Authorization', 'Bearer ' + user.token)
        .send()
        .then(resp => {
          expect(resp.body.ok).to.equal(1);
          return app
                  .get(`${BASE_URL}/${parked._id}`)
                  .set('sys_password', config.sys_password)
        })
        .then(resp => {
          expect(resp.body.status).to.equal("parked");
          return app
                  .get(`/api/parking/${parking._id}`)
        })
        .then(resp => {
          expect(resp.body.availability.current).to.be.true;
          expect(resp.body.availability.until).to.equal(parking.ownerBackAt);          
          done();
        });
    });



});