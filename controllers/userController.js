const model = require('../models/user');
const Event = require('../models/event');
const Rsvp = require('../models/rsvp');

exports.new = (req, res) => {
  res.render('./user/new');
};

exports.create = (req, res, next) => {
  let user = new model(req.body);
  if(user.email)
    user.email = user.email.toLowerCase();
  user.save()
    .then(user => {
      req.flash('success', 'User account created successfully. Please log in.');
      res.redirect('/users/login');
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/new');
      }

      if (err.code === 11000) {
        req.flash('error', 'Email has been used');
        return res.redirect('/users/new');
      }

      next(err);
    });
};


exports.getUserLogin = (req, res, next) => {
  res.render('./user/login');
};

exports.login = (req, res, next) => {
  let { email, password } = req.body;

  if (email) email = email.toLowerCase(); // normalize email

  console.log('Login attempt for:', email);

  model.findOne({ email })
    .then(user => {
      if (!user) {
        console.log('No user found');
        req.flash('error', 'Invalid email');
        return res.redirect('/users/login');
      }

      user.comparePassword(password)
        .then(isMatch => {
          if (!isMatch) {
            console.log('Password mismatch');
            req.flash('error', 'Invalid password');
            return res.redirect('/users/login');
          }

          req.session.user = user._id;
          req.flash('success', 'You are now logged in');

          req.session.save(err => {
            if (err) {
              console.error('Session save error:', err);
              return next(err);
            }
            console.log('Redirecting to homepage');
            res.redirect('/');
          });
        })
        .catch(err => {
          console.error('Error comparing password:', err);
          next(err);
        });
    })
    .catch(err => {
      console.error('Login error:', err);
      next(err);
    });
};





exports.profile = (req, res, next) => {
  const id = req.session.user;

  if (!id) {
    req.flash('error', 'You must be logged in to view profile');
    return res.redirect('/users/login');
  }

  Promise.all([
    model.findById(id).lean(),              // user info
    Event.find({ host: id }).lean(),        // events hosted by the user
    Rsvp.find({ user: id }).populate('event').lean() // RSVPs made by the user
  ])
    .then(([user, events, rsvps]) => {
      res.render('./user/profile', { user, events, rsvps });
    })
    .catch(err => next(err));
};


exports.logout = (req, res, next) => {
  res.cookie('flash', JSON.stringify({ success: ['You have been logged out'] }), { httpOnly: true });
  req.session.destroy(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};
