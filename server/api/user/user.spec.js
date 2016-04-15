var expect = require('chai').expect;
var request = require('supertest-as-promised');
var server = require('../../server.js');
var app = request(server);
var logger = require('../../util/logger')

var seedData = require('../../util/seed.json');

var seedUsers = seedData.users;

describe('[USERS]', () => {

  var BASE_URL = '/api/user';

  describe('[POST]', () => {
    var phone = "333";
    var name = "test";

    it('should post a user', done => {
      app
        .post(BASE_URL)
        .send({ password: "test", name: name, phone: phone })
        .then(resp => {
          expect(resp.status).to.equal(201);
          var user = resp.body;
          expect(user.name).to.equal(name);
          expect(user.phone).to.equal(phone);
          expect(user.password).to.be.undefined;
          expect(user.token).to.be.a('string');
          done();
        });
    });

  });

  it('should get a user', done => {
    app
      .get(`${BASE_URL}/${seedUsers[0]._id}`)
      .then(resp =>  {
        var user = resp.body;
        expect(user.isAdmin).to.be.true;
        expect(user.phone).to.equal(seedUsers[0].phone);
        expect(user.name).to.equal(seedUsers[0].name);
        expect(user.password).to.be.undefined;
        done();
      })
  })

  describe('[GET]', () => {
    it('should get users', done => {
      app
        .get(BASE_URL)
        .then(resp =>  {
          var users = resp.body
          expect(users).to.be.an('array');
          expect(users).to.not.be.empty;
          expect(users[0].password).to.be.undefined;
          done(); 
        });
    });

  });

  describe('[PUT]', () => {
    it('should update a user of it\'s owner', done => {
      var updatedName = "josh";
      app
        .put(BASE_URL + '/' + seedUsers[1]._id)
        .set('Authorization', 'Bearer ' + seedUsers[1].token)
        .send({ "name": updatedName })
        .then(resp => {
          expect(resp.body.ok).to.equal(1)
          return app
                  .get(BASE_URL + '/' + seedUsers[1]._id)
        })
        .then(resp => {
          expect(resp.body.name).to.equal(updatedName);
          done();
        });
    });

    it('should NOT update a user of non owner', done => {
      var source = seedUsers[2];
      var target = seedUsers[3];
      app
        .put(BASE_URL + '/' + target._id)
        .set('Authorization', 'Bearer ' + source.token)
        .send({ "name": "awesome user" })
        .then(resp => {
          expect(resp.status).to.equal(401);
          return app
                  .get(BASE_URL + '/' + target._id)
        })
        .then(resp => {
          expect(resp.body.name).to.equal(target.name);
          done();
        });
    });


  })


});