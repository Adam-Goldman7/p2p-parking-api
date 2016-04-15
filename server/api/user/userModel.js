var mongoose = require('mongoose');
var bcrypt = require('bcrypt-as-promised');
var Schema = mongoose.Schema;

var UsersSchema = getSchema();

UsersSchema.pre('save', preSave);

module.exports = mongoose.model('users', UsersSchema);


function getSchema() {
  return new Schema({

    phone: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    password: {
      type: String,
      select: false,
      required: true
    },

    isAdmin: Boolean

  });
}

function preSave(next) {
  bcrypt.hash(this.password, 10)
    .then(hash => {
      this.password = hash;
      next();
    });
}
