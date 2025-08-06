const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/images' });

const controller = require('../controllers/eventController');
const { fileUpload } = require('../middleware/fileUpload');
const { isLoggedIn, isHost } = require('../middleware/auth');
const { validateEvent, validateResult } = require('../middleware/validator');

// Custom middleware to use validateResult with dynamic event ID for PUT route
const validateEditResult = (req, res, next) => {
  return validateResult(`/events/${req.params.id}/edit`)(req, res, next);
};

// GET /events: send all events
router.get('/', controller.index);

// GET /events/new: show form to create new event
router.get('/new', isLoggedIn, controller.new);

// POST /events: create new event
router.post(
  '/',
  upload.single('banner'),
  isLoggedIn,
  validateEvent,
  validateResult('/events/new'),
  controller.create
);

// GET /events/:id: show event details
router.get('/:id', controller.show);

// GET /events/:id/edit: show edit form
router.get('/:id/edit', isLoggedIn, isHost, controller.edit);

// PUT /events/:id: update event
router.put(
  '/:id',
  upload.single('banner'),
  isLoggedIn,
  isHost,
  validateEvent,
  validateEditResult,
  controller.update
);

// DELETE /events/:id: delete event
router.delete('/:id', isLoggedIn, isHost, controller.delete);

// POST /events/:id/rsvp: handle RSVP
router.post('/:id/rsvp', isLoggedIn, controller.handleRsvp);

module.exports = router;
