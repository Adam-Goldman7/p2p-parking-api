var _ = require('lodash');

var config = {

  dev: "development",
  test: "testing",
  prod: "production",

  sys_password: "sys",

  maxDistance: 500000,

  secrets: {
    jwt: "jwtSecret"
  },

  port: process.env.PORT || 3000,

  db: {
    url: "mongodb://localhost/nodeparking"
  }
}

process.env.NODE_ENV = process.env.NODE_ENV || config.dev;

config.env = process.env.NODE_ENV;
var envConfig = require(`./${config.env}`)

module.exports = _.merge(config, envConfig);