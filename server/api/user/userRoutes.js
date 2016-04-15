var router = require('express').Router();
var auth = require('../auth/auth');
var controller = require('./userController');

router.route('/')
  .get(controller.get)
  .post(controller.post);

router.route('/:id')
  .get(controller.getOne)
  .put(auth.decodeToken, auth.isOwner, controller.put);

module.exports = router;
