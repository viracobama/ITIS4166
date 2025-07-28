const model = require('../models/event');

exports.index = async (req, res) => {
    try {
        const events = await model.find();

        const categories = {};
        events.forEach(event => {
            if (!categories[event.category]) {
                categories[event.category] = [];
            }
            categories[event.category].push(event);
        });

        res.render('./event/index', { categories });
    } catch (err) {
        res.status(500).send("Server Error: " + err.message);
    }
};

exports.new = (req, res) => {
    res.render('./event/new');
};

exports.create = (req, res, next) => {
    try {
        if (!req.body) throw new Error("Request body is missing");
        const event = { ...req.body };

        if (req.file) {
            event.banner = '/images/' + req.file.filename;
        }

        model.save(event);
        res.redirect('/events');
    } catch (err) {
        next(err);
    }
};

exports.show = (req, res, next) => {
  const id = req.params.id;
  const event = model.findByID(id);
  if (event) {
    const formattedDateRange = model.formatDateRange(event);
    res.render('./event/show', { event, formattedDateRange });
  } else {
    const err = new Error('Cannot find an event with id ' + id);
    err.status = 404;
    next(err);
  }
};

exports.edit = (req, res, next) => {
    const id = req.params.id;
    const event = model.findByID(id);
    if (event) {
        res.render('./event/edit', { event });
    } else {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        next(err);
    }
};

exports.update = (req, res, next) => {
    const id = req.params.id;
    const updatedEvent = { ...req.body };

    if (req.file) {
        updatedEvent.banner = '/images/' + req.file.filename;
    }

    console.log("Updating event with ID:", id, updatedEvent);

    if (model.updateById(id, updatedEvent)) {
        res.redirect('/events/' + id);
    } else {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        next(err);
    }
};

exports.delete = (req, res, next) => {
    const id = req.params.id;
    if (model.deleteById(id)) {
        res.redirect('/events');
    } else {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        next(err);
    }
};
