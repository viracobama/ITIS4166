const model = require('../models/user');
const Event = require('../models/event');

exports.new = (req, res) => {
  res.render('./user/new');
};

exports.create = (req, res, next) => {
  let user = new model(req.body);
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
  const { email, password } = req.body;
  console.log('Login attempt for:', email);

  model.findOne({ email })
    .then(user => {
      if (!user) {
        console.log('No user found');
        req.flash('error', 'Invalid email or password');
        return res.redirect('/users/login');
      }

      // Use the Promise returned by comparePassword
      user.comparePassword(password)
        .then(isMatch => {
          if (!isMatch) {
            console.log('Password mismatch');
            req.flash('error', 'Invalid email or password');
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
            res.redirect('/');  // <-- Redirect to homepage here
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
  let id = req.session.user; // <-- just the string ID
  if (!id) {
    req.flash('error', 'You must be logged in to view profile');
    return res.redirect('/users/login');
  }

  Promise.all([model.findById(id), Event.find({ host: id })])
    .then(results => {
      const [user, events] = results;
      res.render('./user/profile', { user, events });
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next) => {
  req.flash('success', 'You have been logged out');
  req.session.destroy(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};
