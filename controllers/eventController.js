const model = require('../models/event');
const { DateTime } = require('luxon');
const mongoose = require('mongoose');

// GET /events - List all events grouped by category
exports.index = (req, res, next) => {
  model.find().lean()
    .then(events => {
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
    const err = new Error('Invalid event ID');
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

      const start = DateTime.fromJSDate(event.start);
      const end = DateTime.fromJSDate(event.end);
      const formattedDateRange = `${start.toFormat('cccc, LLLL dd, yyyy')}, ${start.toFormat('h:mm a')} - ${end.toFormat('h:mm a')}`;

      res.render('./event/show', { event, formattedDateRange });
    })
    .catch(err => {
      if (!err.status) err.status = 500;
      next(err);
    });
};

// GET /events/:id/edit - Edit event form
exports.edit = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid event ID');
    err.status = 400;
    return next(err);
  }

  model.findById(id).lean()
    .then(event => {
      if (!event) {
        const err = new Error('Event not found');
        err.status = 404;
        throw err;
      }

      event.start = DateTime.fromJSDate(new Date(event.start)).toISO({
        suppressSeconds: true,
        suppressMilliseconds: true,
        includeOffset: false,
      });

      event.end = DateTime.fromJSDate(new Date(event.end)).toISO({
        suppressSeconds: true,
        suppressMilliseconds: true,
        includeOffset: false,
      });

      res.render('./event/edit', { event });
    })
    .catch(err => {
      if (!err.status) err.status = 500;
      next(err);
    });
};

// PUT /events/:id - Update event
exports.update = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid event ID');
    err.status = 400;
    return next(err);
  }

  const updatedEvent = { ...req.body };
  if (req.file) {
    updatedEvent.banner = '/images/' + req.file.filename;
  }

  model.findByIdAndUpdate(id, updatedEvent, { new: true, runValidators: true })
    .then(event => {
      if (!event) {
        const err = new Error('Event not found');
        err.status = 404;
        throw err;
      }

      res.redirect('/events/' + id);
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

// DELETE /events/:id - Delete event
exports.delete = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid event ID');
    err.status = 400;
    return next(err);
  }

  model.findByIdAndDelete(id)
    .then(event => {
      if (!event) {
        const err = new Error('Event not found');
        err.status = 404;
        throw err;
      }

      res.redirect('/events');
    })
    .catch(err => {
      err.status = 500;
      next(err);
    });
};
