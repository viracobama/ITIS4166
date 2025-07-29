// require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const eventRoutes = require('./routes/eventRoutes');
const { MongoClient } = require('mongodb');
const { getCollection } = require('./models/event.js');
const mongoose = require('mongoose');

// create app
const app = express();

// configure app
const port = 3000;
const host = 'localhost';
const url = 'mongodb://localhost:27017';



app.set('view engine', 'ejs');

async function startServer() {
  try {
    // connect to MongoDB
    const client = await MongoClient.connect(url);
    const db = client.db('demos');

    // initialize the events collection in your model
    getCollection(db);

    // mount middleware
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('tiny'));
    app.use(methodOverride('_method'));

    // define routes
    app.get('/', (req, res) => res.render('index'));

    app.get('/about', (req, res) => res.render('about'));

    app.get('/contact', (req, res) => res.render('contact'));

    app.use('/events', eventRoutes);

    // 404 handler
    app.use((req, res, next) => {
      let err = new Error('The server cannot locate ' + req.url);
      err.status = 404;
      next(err);
    });

    // error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      if (!err.status) {
        err.status = 500;
        err.message = 'Internal Server Error';
      }
      res.status(err.status);
      res.render('error', { error: err });
    });

    // start server only after everything is set up
    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

// start the app
startServer();
