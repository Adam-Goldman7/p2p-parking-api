var mongoose = require('mongoose');
var express = require('express');
var app = express();

var config = require('./config/config');
var api = require('./api/api');

require('mongoose').connect(config.db.url);

// dev/tests
if (config.seed)
  require('./util/seed');

require('./middleware/appMiddleware')(app);

app.use('/api', api);

app.use(require('./middleware/errorMiddleware'));
app.use(require('./middleware/404Middleware'));

module.exports = app;