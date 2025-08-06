const model = require('../models/event');
const Rsvp = require('../models/rsvp');
const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// GET /events - List all events grouped by category
exports.index = (req, res, next) => {
  model.find().lean()
    .then(events => {
      // Log each event's attributes and values
      events.forEach(event => {
        console.log('--- Event ---');
        Object.entries(event).forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });
      });

      // Group by category
      const categoriesList = [...new Set(events.map(e => e.category))];
      const categories = {};
      categoriesList.forEach(cat => {
        categories[cat] = events.filter(event => event.category === cat);
      });

      res.render('./event/index', { categories });
    })
    .catch(err => next(err));
};


// GET /events/new - Show event creation form
exports.new = (req, res) => {
  res.render('./event/new');
};

// POST /events - Create a new event
exports.create = (req, res, next) => {
  if (!req.body) {
    const err = new Error("Request body is missing");
    err.status = 400;
    return next(err);
  }

  const eventData = { ...req.body };
  eventData.host = req.session.user; 

  if (req.file) {
    eventData.banner = '/images/' + req.file.filename;
  }

  const event = new model(eventData);

  event.save()
    .then(() => {
      req.flash('success', 'Event created successfully');
      res.redirect('/events');
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        err.status = 400;
      } else {
        err.status = 500;
      }
      next(err);
    });
};

// GET /events/:id - Show details of an event
exports.show = async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid event id');
    err.status = 400;
    return next(err);
  }

  try {
    const event = await model.findById(id).populate('host').lean();

    if (!event) {
      const err = new Error('Cannot find event with ID ' + id);
      err.status = 404;
      return next(err);
    }

    const start = DateTime.fromISO(event.start.toISOString()).toFormat("ccc, LLL d, yyyy, h:mm a");
    const end = DateTime.fromISO(event.end.toISOString()).toFormat("ccc, LLL d, yyyy, h:mm a");
    const formattedDateRange = `${start} - ${end}`;

    const yesCount = await Rsvp.countDocuments({ event: event._id, status: 'YES' });

    res.render('./event/show', { event, formattedDateRange, yesCount });

  } catch (err) {
    next(err);
  }
};



// GET /events/:id/edit - Edit event form
exports.edit = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid event id");
    err.status = 400;
    return next(err);
  }

  model.findById(id)
    .populate('host')
    .lean()
    .then(event => {
      if (!event) {
        const err = new Error("Cannot find event with id " + id);
        err.status = 404;
        throw err;
      }

      if (String(event.host._id) !== String(req.session.user)) {
        // Render error page without redirect
        res.status(401).render('error', {
          error: {
            status: 401,
            message: 'You are not authorized to edit this event.'
          }
        });
        return;
      }

      const startISO = DateTime.fromJSDate(new Date(event.start))
        .toISO({ suppressSeconds: true, suppressMilliseconds: true, includeOffset: false });

      const endISO = DateTime.fromJSDate(new Date(event.end))
        .toISO({ suppressSeconds: true, suppressMilliseconds: true, includeOffset: false });

      res.render('./event/edit', { event, startISO, endISO });
    })
    .catch(err => next(err));
};



// PUT /event/:id - Update event
exports.update = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await model.findById(eventId);

    if (!event) {
      const err = new Error('Event not found');
      err.status = 404;
      return next(err);
    }

    if (String(event.host) !== String(req.session.user)) {
      res.status(401).render('error', {
        error: { status: 401, message: 'You are not authorized to edit this event.' }
      });
      return; // <== YOU NEED THIS
    }


    event.category = req.body.category;
    event.title = req.body.title;
    event.details = req.body.details;
    event.location = req.body.location;
    event.start = new Date(req.body.start);
    event.end = new Date(req.body.end);

    if (req.file) {
      if (event.banner && event.banner.startsWith('/images/')) {
        const oldPath = path.join(__dirname, '..', 'public', event.banner);
        fs.unlink(oldPath, err => {
          if (err) console.error('Failed to delete old banner:', err);
        });
      }
      event.banner = '/images/' + req.file.filename;
    }

    await event.save();

    console.log('Session User:', req.session.user);
    console.log('Event Host:', event.host);

    req.flash('success', 'Event updated successfully');
    res.redirect(`/events/${eventId}`);
  } catch (err) {
    next(err);
  }
};


// DELETE /events/:id - Delete event
exports.delete = async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid event ID');
    err.status = 400;
    return next(err);
  }

  try {
    const event = await model.findById(id);
    if (!event) {
      const err = new Error('Event not found');
      err.status = 404;
      return next(err);
    }

    if (String(event.host) !== String(req.session.user)) {
      const err = new Error('You are not authorized to delete this event.');
      err.status = 401;
      return next(err);
    }

    // Delete banner if exists
    if (event.banner && event.banner.startsWith('/images/')) {
      const bannerPath = path.join(__dirname, '..', 'public', event.banner);
      fs.unlink(bannerPath, err => {
        if (err) console.error('Failed to delete banner:', err);
      });
    }

    // 🔥 Delete associated RSVPs
    await Rsvp.deleteMany({ event: id });

    // Then delete the event itself
    await model.findByIdAndDelete(id);

    req.flash('success', 'Event and RSVPs deleted successfully');
    res.redirect('/events');
  } catch (err) {
    next(err);
  }
};


exports.handleRsvp = async (req, res, next) => {
  console.log('req.body:', req.body); 
  console.log('RSVP route hit');
  console.log('user:', req.session.user);
  console.log('event ID:', req.params.id);

  try {
    const eventId = req.params.id;
    const userId = req.session.user;

    // Check if eventId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      const err = new Error(`Cannot find an event with id ${eventId}`);
      err.status = 404;
      return res.status(404).render('error', { error: err });
    }

    if (!req.body || !req.body.status) {
      req.flash('error', 'RSVP cannot be empty');
      return res.redirect(`/events/${eventId}`);
    }

    const status = req.body.status.toUpperCase();
    const validStatuses = ['YES', 'NO', 'MAYBE'];

    if (!validStatuses.includes(status)) {
      req.flash('error', 'RSVP can only be YES, NO, or MAYBE');
      return res.redirect(`/events/${eventId}`);
    }

    const event = await model.findById(eventId);
    if (!event) {
      const err = new Error('Event not found');
      err.status = 404;
      return res.status(404).render('error', { error: err });
    }

    if (String(event.host) === String(userId)) {
      const err = new Error('You cannot RSVP to your own event');
      err.status = 401;
      return res.status(401).render('error', { error: err });
    }

    const existingRsvp = await Rsvp.findOne({ user: userId, event: eventId });

    if (existingRsvp) {
      existingRsvp.status = status;
      await existingRsvp.save();
      req.flash('success', 'Successfully updated your RSVP for this event!');
    } else {
      await Rsvp.create({ user: userId, event: eventId, status });
      req.flash('success', 'Successfully created an RSVP for this event!');
    }

    res.redirect(`/users/profile`);
  } catch (err) {
    next(err);
  }
};
