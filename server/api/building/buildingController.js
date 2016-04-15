var Building = require('./buildingModel');

module.exports = {
  get: get,
  getOne: getOne,
  post: post,
  put: put
}

function get(req, res, next) {
  Building.find()
    .then(buildings => res.json(buildings))
    .catch(next);
}

function getOne(req, res, next) {
  var id = req.params.id;
  Building.findById(id)
    .then(building => building ? res.json(building) : res.status(404).send("building doesn't exist"))
    .catch(next);
}

function post(req, res, next) {
  var newBuilding = req.body;

  Building.create(newBuilding)
    .then(building =>res.status(201).json(building))
    .catch(next);
}

function put(req, res, next) {
  Building.update({_id: req.params.id}, { $set: req.body })
    .then(DBres => res.json(DBres))
    .catch(next);
}