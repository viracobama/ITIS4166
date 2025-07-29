const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const eventRoutes = require('./routes/eventRoutes');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const port = 3000;
const host = 'localhost';
const url = 'mongodb://localhost:27017/demos';

// Set views directory explicitly (helps avoid issues)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
app.use('/events', eventRoutes);

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

// Connect to MongoDB with Mongoose and then start server
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
