var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logger = require('../../util/logger');

var ParkingsSchema = getSchema();

ParkingsSchema.index({ location: 1 });

module.exports = mongoose.model('parkings', ParkingsSchema);


function getSchema() {
  return new Schema({

    address: {
      type: String,
      required: true
    },

    availability: {
      current: {
        type: Boolean,
        required: true,
        default: false
      },
      until: Number
    },

    ownerBackAt: Number,

    price: {
      type: Number,
      required: true,
      min: 0
    },

    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'buildings'
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },

    spot: {
      type: Number,
      required: true
    },

    location: {
      type: [Number],
      index: '2dsphere',
      required: true
    }

  });
}