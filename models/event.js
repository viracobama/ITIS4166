const { DateTime } = require("luxon");
const { v4: uuidv4 } = require("uuid");
const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  category: {
    type: String,
    required: [true, 'category is required'],
    enum: ['Clubbing', 'Concert', 'Festival', 'Party', 'Other'], // <-- Enum here
  },
  title: { type: String, required: [true, 'title is required'] },
  host: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'host is required'] },
  details: { type: String, required: [true, 'details is required'] },
  location: { type: String, required: [true, 'location is required'] },
  start: { type: Date, required: [true, 'Start date is required'] },
  end: { type: Date, required: [true, 'End date is required'] },
  banner: String,
});

//collection name is event in the database
module.exports = mongoose.model('Event', eventSchema);
