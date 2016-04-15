var router = require('express').Router();
var auth = require('../auth/auth');
var controller = require('./parkedController');

router.route('/')
  .post(auth.decodeToken, auth.getFreshUser, controller.post);

router.route('/:id')
  .get(auth.isSystem, controller.getOne);

router.route('/:id/start')
  .put(auth.decodeToken, auth.getFreshUser, controller.start);

router.route('/:id/end')
  .put(auth.decodeToken, auth.getFreshUser, controller.end);

module.exports = router;