const model = require('../models/event');
const { DateTime } = require('luxon');  

exports.index = (req, res, next) => {
  model.find()
    .then(events => {
      // Group events by category
      const categories = {};
      events.forEach(event => {
        if (!categories[event.category]) {
          categories[event.category] = [];
        }
        categories[event.category].push(event);
      });

      res.render('./event/index', { categories });
    })
    .catch(err => next(err));
};

exports.create = (req, res, next) => {
  if (!req.body) {
    return next(new Error("Request body is missing"));
  }

  const event = { ...req.body };
  if (req.file) {
    event.banner = '/images/' + req.file.filename;
  }

  model.save(event)
    .then(() => {
      res.redirect('/events');
    })
    .catch(err => next(err));
};


exports.show = async (req, res, next) => {
    let id = req.params.id;//string type
    model.findByID(id)
    .then(event=>{
        if (event) {
            const formattedDateRange = model.formatDateRange(event);
            res.render('./event/show', { event, formattedDateRange });
            console.log("Looking for event ID:", id);
            console.log("Found event:", event);
        } else {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        next(err);
        }
    }) 
    .catch (err=>next(err)); 
};

exports.edit = (req, res, next) => {
  const id = req.params.id;

  model.findByID(id)
    .then(event => {
      if (!event) {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        return next(err);
      }

      event.start = DateTime.fromISO(event.start).toFormat("yyyy-MM-dd'T'HH:mm");
      event.end = DateTime.fromISO(event.end).toFormat("yyyy-MM-dd'T'HH:mm");

      res.render('./event/edit', { event });
    })
    .catch(err => next(err));
};



exports.update = (req, res, next) => {
  const id = req.params.id;
  const updatedEvent = { ...req.body };

  if (req.file) {
    updatedEvent.banner = '/images/' + req.file.filename;
  }

  console.log("Updating event with ID:", id, updatedEvent);

  model.updateById(id, updatedEvent)
    .then(success => {
      if (success) {
        res.redirect('/events/' + id);
      } else {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        next(err);
      }
    })
    .catch(err => next(err));
};


exports.delete = (req, res, next) => {
  const id = req.params.id;

  model.deleteById(id)
    .then(success => {
      if (success) {
        res.redirect('/events');
      } else {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        next(err);
      }
    })
    .catch(err => next(err));
};

exports.new = (req, res) => {
  res.render('./event/new');
};