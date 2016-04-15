var router = require('express').Router();
var controller = require('./buildingController');
var auth = require('../auth/auth');

router.route('/')
  .get(controller.get)
  .post(controller.post);

router.route('/:id')
  .get(controller.getOne)
  .put(auth.decodeToken, auth.getFreshUser, auth.isAdmin, controller.put)

module.exports = router;