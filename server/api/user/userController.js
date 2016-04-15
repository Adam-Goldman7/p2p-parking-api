var auth = require('../auth/auth');
var logger = require('../../util/logger')
var User = require('./userModel');

module.exports = {
  get: get,
  getOne: getOne,
  post: post,
  put: put
}

function get(req, res, next) {
  User.find()
    .then(users => res.json(users))
    .catch(next);
}

function getOne(req, res, next) {
  var id = req.params.id;
  User.findById(id)
    .then(user =>  user ? res.json(user) : res.status(404).send("user doesn't exist"))
    .catch(next);
}

function post(req, res, next) {
  var newUser = req.body;

  User.create(newUser)
    .then(user => {
      user = user.toObject();
      delete user.password;
      user.token = auth.signToken(user._id);
      res.status(201).json(user);
    })
    .catch(next);
}

function put(req, res, next) {
  User.update({_id: req.params.id}, { $set: req.body })
    .then(DBres => res.json(DBres))
    .catch(next);
}