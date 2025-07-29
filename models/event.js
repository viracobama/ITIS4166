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
  host: { type: String, required: [true, 'host is required'] },
  details: { type: String, required: [true, 'details is required'] },
  location: { type: String, required: [true, 'location is required'] },
  start: { type: Date, required: [true, 'Start date is required'] },
  end: { type: Date, required: [true, 'End date is required'] },
  banner: String,
});

//collection name is event in the database
module.exports = mongoose.model('Event', eventSchema);
/*
const events = [
  {
    id: '1',
    category: 'Clubbing',
    title: 'Emo Nite',
    host: 'DJ Shadow',
    details: 'A night full of emo classics and dark vibes.',
    location: 'Downtown Club',
    start: '2025-07-01T20:00:00',
    end: '2025-07-02T02:00:00',
    banner: '/images/emo-nite.jpg'
  },
  {
    id: '2',
    category: 'Clubbing',
    title: 'Kpop Club Night',
    host: 'K-Crew',
    details: 'Dance all night to the hottest Kpop hits.',
    location: 'Seoul Lounge',
    start: '2025-08-12T19:00:00',
    end: '2025-08-13T01:00:00',
    banner: '/images/kpop-club-night.jpg'
  },
  {
    id: '3',
    category: 'Clubbing',
    title: 'Shrek Night',
    host: 'Fiona DJs',
    details: 'Get swampy with some green beats and fun surprises.',
    location: 'Fairy Tale Club',
    start: '2025-09-05T21:00:00',
    end: '2025-09-06T03:00:00',
    banner: '/images/shrek-rave.png'
  },
  {
    id: '4',
    category: 'Concert',
    title: 'Katseye',
    host: 'Greffen Records',
    details: 'An electrifying indie concert by Katseye.',
    location: 'City Arena',
    start: '2025-10-10T18:30:00',
    end: '2025-10-10T22:00:00',
    banner: '/images/katseye.jpg'
  },
  {
    id: '5',
    category: 'Concert',
    title: 'Pierce The Veil',
    host: 'Rock Nation',
    details: 'High energy rock concert with special guests.',
    location: 'The Grand Theater',
    start: '2025-11-15T20:00:00',
    end: '2025-11-15T23:30:00',
    banner: '/images/pierce-the-veil.jpeg'
  },
  {
    id: '6',
    category: 'Concert',
    title: 'Breakway',
    host: 'Live Events',
    details: 'Alternative rock concert with Breakway band.',
    location: 'Open Air Park',
    start: '2025-12-05T19:00:00',
    end: '2025-12-05T22:30:00',
    banner: '/images/breakaway.jpg'
  }
];


//need a reference events collection in mongodb
let events; 
exports.getCollection = db => {
  events = db.collection('events');
};

exports.find = () => events.find().toArray();

exports.findByID = (id) => {
  if (!ObjectId.isValid(id)) return Promise.resolve(null);
  return events.findOne({ _id: new ObjectId(id) });
};

exports.save = async function(event) {
  event.id = uuidv4();
  event.start = DateTime.fromISO(event.start).toISO();
  event.end = DateTime.fromISO(event.end).toISO();
  event.banner = event.banner || '';

  return await events.insertOne(event);
};

exports.updateById = async (id, newEvent) => {
  if (!ObjectId.isValid(id)) return false;
  const update = {
    $set: {
      category: newEvent.category,
      title: newEvent.title,
      host: newEvent.host,
      start: DateTime.fromISO(newEvent.start).toISO(),
      end: DateTime.fromISO(newEvent.end).toISO(),
      location: newEvent.location,
      details: newEvent.details,
      banner: newEvent.banner || '',
    }
  };
  const result = await events.updateOne({ _id: new ObjectId(id) }, update);
  return result.modifiedCount > 0;
};

exports.deleteById = async (id) => {
  if (!ObjectId.isValid(id)) return false;
  const result = await events.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
};

exports.formatDateRange = function(event) {
  const start = DateTime.fromISO(event.start);
  const end = DateTime.fromISO(event.end);
  return `${start.toFormat('cccc, LLLL dd, yyyy')}, ${start.toFormat('h:mm a')} - ${end.toFormat('h:mm a')}`;
};
*/