const model = require('../models/event');
const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// GET /events - List all events grouped by category
exports.index = (req, res, next) => {
  model.find().lean()
    .then(events => {
      // 🔍 Log each event's attributes and values
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
    .then(() => res.redirect('/events'))
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
exports.show = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid event id');
    err.status = 400;
    return next(err);
  }

  model.findById(id).populate('host').lean()
    .then(event => {
      if (!event) {
        const err = new Error('Cannot find event with ID ' + id);
        err.status = 404;
        return next(err);
      }

      const start = DateTime.fromISO(event.start.toISOString()).toLocaleString(DateTime.DATETIME_MED);
      const end = DateTime.fromISO(event.end.toISOString()).toLocaleString(DateTime.DATETIME_MED);

      const formattedDateRange = `${start} - ${end}`;

      res.render('./event/show', { event, formattedDateRange });
    })
    .catch(err => next(err));
};

// GET /event/:id/edit - Edit event form
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

      // Prepare ISO strings for datetime-local inputs (local time, no offset)
      const startISO = event.start
        ? DateTime.fromJSDate(new Date(event.start))
            .toISO({ suppressSeconds: true, suppressMilliseconds: true, includeOffset: false })
        : '';

      const endISO = event.end
        ? DateTime.fromJSDate(new Date(event.end))
            .toISO({ suppressSeconds: true, suppressMilliseconds: true, includeOffset: false })
        : '';

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
      const err = new Error('Unauthorized to update this event');
      err.status = 403;
      return next(err);
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
exports.delete = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid event id');
    err.status = 400;
    return next(err);
  }

  model.findById(id)
    .then(event => {
      if (!event) {
        const err = new Error('Event not found');
        err.status = 404;
        throw err;
      }

      if (String(event.host) !== String(req.session.user)) {
        const err = new Error('Unauthorized to delete this event');
        err.status = 403;
        throw err;
      }

      if (event.banner && event.banner.startsWith('/images/')) {
        const bannerPath = path.join(__dirname, '..', 'public', event.banner);
        fs.unlink(bannerPath, err => {
          if (err) console.error('Failed to delete banner:', err);
        });
      }

      console.log('Session User:', req.session.user);
      console.log('Event Host:', event.host);

      return model.findByIdAndDelete(id);
    })
    .then(() => res.redirect('/events'))
    .catch(err => next(err));
};
