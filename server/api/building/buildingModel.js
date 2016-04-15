var mongoose = require('mongoose');
var bcrypt = require('bcrypt-as-promised');
var Schema = mongoose.Schema;

var BuildingSchema = getSchema();

BuildingSchema.index({ location: 1 });

BuildingSchema.pre('save', preSave);

module.exports = mongoose.model('buildings', BuildingSchema);


function getSchema() {

  return new Schema({

    address: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      default: 5,
      min: 0 
    },

    password: {
      type: String,
      select: false,
      required: true
    },

    location: {
      type: [Number],
      index: '2dsphere',
      required: true
    },

    adminId: Schema.Types.ObjectId

  });

}

function preSave(next) {
  bcrypt.hash(this.password, 10)
    .then(hash => {
      this.password = hash; 
      next();
    });
}