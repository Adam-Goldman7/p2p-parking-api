var request = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('./server');
var app = request(server);

describe('[SERVER]', () => {

  afterEach(() => {
    console.log('\n')
  });

  require('../test/db_cleanup');

  it('should return error message according to error middleware', done => {
    app
      .post('/api/building')
      .then(resp => {
        expect(resp.error.text).to.equal('err: buildings validation failed');
        done();
      });
  });

});