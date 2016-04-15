var mongoose = require('mongoose');

module.exports = after('clean db', function(done) {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});