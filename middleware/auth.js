const Event = require('../models/event');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    if(!req.session.user) {
    return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
}

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'You need to log in first');
  res.redirect('/users/login');
};

exports.isHost = async (req, res, next) => {
  const id = req.params.id;
  try {
    const event = await Event.findById(id);
    if (!event) {
      const err = new Error('Event not found');
      err.status = 404;
      return next(err);
    }

    if (String(event.host) !== String(req.session.user)) {
      const err = new Error('You are not authorized to modify this event');
      err.status = 401;
      return next(err); // Let error handler render the error page
    }

    next();
  } catch (err) {
    next(err);
  }
};

