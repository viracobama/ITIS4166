const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const cookieParser = require('cookie-parser'); // requried to parse cookies for flash messages on logout



const User = require('./models/user');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 3000;
const host = 'localhost';
const url = 'mongodb+srv://vbou:demo123@project3.hnrgn24.mongodb.net/demos?retryWrites=true&w=majority&appName=project3';
const store = MongoStore.create({ mongoUrl: url });

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(cookieParser());

store.on('error', function(error) {
  console.error('Session store error:', error);
});

app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: url }),
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

app.use(flash());

// User middleware to expose current user to all views
app.use(async (req, res, next) => {
  // If flash cookie exists, move it into req.flash
  if (req.cookies && req.cookies.flash) {
    try {
      const flash = JSON.parse(req.cookies.flash);
      for (const [type, messages] of Object.entries(flash)) {
        messages.forEach(msg => req.flash(type, msg));
      }
      res.clearCookie('flash');
    } catch (err) {
      console.error('Error parsing flash cookie:', err);
      res.clearCookie('flash');
    }
  }

  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user);
      res.locals.user = user;
      req.user = user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.locals.user = null;
      req.user = null;
    }
  } else {
    res.locals.user = null;
    req.user = null;
  }

  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});



// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('The server cannot locate ' + req.url);
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!err.status) {
    err.status = 500;
    err.message = 'Internal Server Error';
  }
  res.status(err.status);
  res.render('error', { error: err });
});

// Connect to MongoDB and start server
mongoose.connect(url)
  .then(() => {
    console.log('Mongoose connected to', url);
    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
  });
