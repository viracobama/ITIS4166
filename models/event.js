const { DateTime } = require("luxon");
const { v4: uuidv4 } = require("uuid");

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

exports.find = () => events;

exports.findByID = id => events.find(event => event.id === id);

exports.save = function(event) {
  event.id = uuidv4();

  // Format start and end as strings for display
  event.start = DateTime.fromISO(event.start).toLocaleString(DateTime.DATETIME_FULL);
  event.end = DateTime.fromISO(event.end).toLocaleString(DateTime.DATETIME_FULL);

  // Use the banner from event or default to empty string
  event.banner = event.banner || '';

  events.push(event);
};

exports.updateById = function(id, newEvent) {
  let event = events.find(event => event.id === id);
  if (event) {
    event.category = newEvent.category;
    event.title = newEvent.title;
    event.host = newEvent.host;
    event.start = DateTime.fromISO(newEvent.start).toLocaleString(DateTime.DATETIME_FULL);
    event.end = DateTime.fromISO(newEvent.end).toLocaleString(DateTime.DATETIME_FULL);
    event.location = newEvent.location;
    event.details = newEvent.details;
    event.banner = newEvent.banner && newEvent.banner !== '' ? newEvent.banner : event.banner;
    return true;
  } else {
    return false;
  }
};

exports.deleteById = function(id) {
  let index = events.findIndex(event => event.id === id);
  if (index !== -1) {
    events.splice(index, 1);
    return true;
  } else {
    return false;
  }
};

exports.formatDateRange = function(event) {
  const start = DateTime.fromISO(event.start);
  const end = DateTime.fromISO(event.end);
  return `${start.toFormat('cccc, LLLL dd, yyyy')}, ${start.toFormat('h:mm a')} - ${end.toFormat('h:mm a')}`;
};