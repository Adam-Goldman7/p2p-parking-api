var logger = require('../../util/logger');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schedule = require('node-schedule');
var ParkedSchedule = require('./parkedSchedule');

var ParkedsSchema = getSchema();

ParkedsSchema.post('save', postSave);
ParkedsSchema.post('update', postUpdate);

module.exports = mongoose.model('parkeds', ParkedsSchema);


function getSchema() {
  return new Schema({

    parkerId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },

    parkingId: {
      type: Schema.Types.ObjectId,
      ref: 'parkings',
      required: true
    },

    status: {
      type: String,
      required: true,
      default: 'booked'
    },

    until: {
      type: Number,
      required: true
    }

  });
}

function postSave(doc) {
  var id = doc._id;
  var notificationTime = Date.now() + 1000 * 60 * 15;
  logger.log('setting up booking reminder for ', id);
  ParkedSchedule.bookingEnds[id] = schedule.scheduleJob(notificationTime, function(){
    logger.log('booking reminder: 15 minutes passed... ', id);
  });
}

function postUpdate() {
  var id = this._conditions._id;
  var status = this._update.$set && this._update.$set.status;

  if (status === "parking") {
    ParkedSchedule.bookingEnds[id].cancel();
    delete ParkedSchedule.bookingEnds[id];
    this.findOne(id)
      .then(doc => {
        var notificationTime = doc.until - 1000 * 60 * 30;
        logger.log('setting up parking reminder for ', id);
        ParkedSchedule.parkingEnds[id] = schedule.scheduleJob(notificationTime, function(){
          logger.log('parking expires in 30 minutes ... ', id);
        });
      })
  } else if (status === "parked") {
    logger.log('removing up parking reminder for ', id);
    ParkedSchedule.parkingEnds[id].cancel();
  }

}