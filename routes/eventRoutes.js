const express = require('express');
const controller = require('../controllers/eventController');
const router = express.Router();
const { fileUpload } = require('../middleware/fileUpload'); //
const multer = require('multer');
const upload = multer({ dest: 'public/images' });
const { isLoggedIn, isHost } = require('../middleware/auth');

// GET /events: send all events to the user
router.get('/', controller.index);

// GET /events/new: send HTML form for creating a new event
router.get('/new', isLoggedIn, controller.new);

// POST /events: create a new event
router.post('/', upload.single('banner'), isLoggedIn, controller.create);

// GET /events/:id: send details of event identified by id
router.get('/:id', controller.show);

// GET /events/:id/edit: send HTML form for editing an existing event
router.get('/:id/edit', isLoggedIn, isHost, controller.edit);

// PUT /events/:id: update the event identified by id
router.put('/:id', upload.single('banner'), isLoggedIn, isHost, controller.update);

// DELETE /events/:id: delete the event identified by id
router.delete('/:id', isLoggedIn, isHost, controller.delete);

module.exports = router;
