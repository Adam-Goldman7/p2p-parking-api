var expect = require('chai').expect;
var request = require('supertest-as-promised');
var server = require('../../server.js');
var app = request(server);
var logger = require('../../util/logger')

var seedData = require('../../util/seed.json');
var seedBuildings = seedData.buildings;
var seedParkings = seedData.parkings;
var seedUsers = seedData.users;

describe('[PARKINGS]', () => {

  var BASE_URL = '/api/parking';
  var genericBuilding = seedBuildings[6];

  describe('[POST]', () => {
    var spot = 2;
    var user = seedUsers[10];
    it('should post a parking', done => {
      app
        .post(BASE_URL)
        .set('Authorization', 'Bearer ' + user.token)
        .send({buildingPassword: genericBuilding.password, spot: spot, buildingId: genericBuilding._id })
        .then(resp =>{
          expect(resp.status).to.equal(201);
          var parking = resp.body;
          expect(parking.userId).to.equal(user._id);
          expect(parking.buildingId).to.equal(genericBuilding._id);
          expect(parking.address).to.equal(genericBuilding.address);
          expect(parking.price).to.equal(genericBuilding.price);
          expect(parking.location).to.eql(genericBuilding.location);
          expect(parking.spot).to.equal(spot);
          expect(parking.availability.current).to.be.false;
          done();
        });
    });

    it('should reject posting a parking with wrong building password', done => {
      app
        .post(BASE_URL)
        .set('Authorization', 'Bearer ' + seedUsers[11].token)
        .send({ buildingPassword: "notThePassword", spot: spot, buildingId: genericBuilding._id })
        .then(resp =>{
          expect(resp.status).to.equal(401);
          done();
        });
    });

    it('should make first user parking an admin', done => {
      var parking;
      var user = seedUsers[12];
      app
        .post(BASE_URL)
        .set('Authorization', 'Bearer ' + user.token)
        .send({ buildingPassword: seedBuildings[7].password, spot: 3, buildingId: seedBuildings[7]._id })
        .then(resp => {
          expect(resp.status).to.equal(201);
          return app
                  .get('/api/building/' + seedBuildings[7]._id);
        })
        .then(resp => {
          expect(resp.body.adminId).to.equal(user._id);
          done();
        });
    });

    it('should NOT make ANOTHER admin', done => {
      var user = seedUsers[13];
      app
        .post(BASE_URL)
        .set('Authorization', 'Bearer ' + user.token)
        .send({ buildingPassword: genericBuilding.password, spot: 3, buildingId: genericBuilding._id })
        .then(resp => {
          expect(resp.status).to.equal(201);
          return app
                  .get('/api/building/' + genericBuilding._id);
        })
        .then(resp => {
          expect(resp.body.adminId).to.not.be.equal(user._id);
          done();
        })
    });

  });

  it('should get a parking', done => {
    app
      .get(`${BASE_URL}/${seedParkings[0]._id}`)
      .then(resp => {
        var parking = resp.body;
        expect(parking.availability.current).to.not.be.undefined;
        expect(parking.phone).to.equal(seedParkings[0].phone);
        expect(parking.spot).to.equal(seedParkings[0].spot);
        expect(parking.name).to.equal(seedParkings[0].name);
        expect(parking.price).to.equal(genericBuilding.price);
        expect(parking.address).to.equal(genericBuilding.address);
        expect(parking.location).to.eql(genericBuilding.location);
        expect(parking.password).to.be.undefined;
        done();
      })
  })

  describe('[GET]', () => {
    it('should get parkings', done => {
      app
        .get(BASE_URL)
        .then(resp => {
          var parkings = resp.body
          expect(parkings).to.be.an('array');
          expect(parkings).to.not.be.empty;
          expect(parkings[0].password).to.be.undefined;
          done(); 
        });
    });

    it('should get availble parkings sorted by location', done => {
      var lon = 40.7114079;
      var lat = -74.0077649;
      var duration = 1000 * 60 * 60 * 2;

      app.get(BASE_URL + '/location')
        .query({lon: lon, lat: lat, duration: duration})
        .then(resp => {
          var parkings = resp.body;
          expect(parkings).to.be.an('array');
          expect(parkings).to.not.be.empty;
          parkings.map(p => {
            expect(p.availability.current).to.be.true;
            expect(p.availability.until).to.be.above(Date.now() + duration)
          });
          done();
        });
    });

  });

  describe('[PUT]', () => {
    it('should update a parking of it\'s owner', done => {
      var updatedSpot = 1000;
      app
        .put(BASE_URL + '/' + seedParkings[1]._id)
        .set('Authorization', 'Bearer ' + seedUsers[1].token)
        .send({ "spot": updatedSpot })
        .then(resp => {
          expect(resp.body.ok).to.equal(1)
          return app
                  .get(BASE_URL + '/' + seedParkings[1]._id)
        })
        .then(resp => {
          expect(resp.body.spot).to.equal(updatedSpot);
          done();
        });
    });

    it('should NOT update a parking of non owner', done => {
      var user = seedUsers[2];
      var parkingOfAnotherUser = seedParkings[3];
      app
        .put(BASE_URL + '/' + parkingOfAnotherUser._id)
        .set('Authorization', 'Bearer ' + user.token)
        .send({ "spot": 999 })
        .then(resp => {
          expect(resp.status).to.equal(401);
          return app
                  .get(BASE_URL + '/' + parkingOfAnotherUser._id)
        })
        .then(resp => {
          expect(resp.body.spot).to.equal(parkingOfAnotherUser.spot);
          done();
        });
    });

  });


});