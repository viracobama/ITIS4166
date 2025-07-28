const express = require('express');
const controller = require('../controllers/eventController');
const router = express.Router();
const { fileUpload } = require('../middleware/fileUpload'); //
const multer = require('multer');
const upload = multer({ dest: 'public/images' });

//GET /stories: send all stories to the user

router.get('/', controller.index);

//GET /stories/new: send html form for creating a new story

router.get('/new', controller.new);

//POST /stories: create a new story

router.post('/', upload.single('image'), controller.create);

//GET /stories/:id: send details of story identified by id
router.get('/:id', controller.show);

//GET /stories/:id/edit: send html form for editing an existing story
router.get('/:id/edit', controller.edit);

//PUT /stories/:id: update the story identified by id
router.put('/:id', upload.single('image'), controller.update);

//DELETE /stories/:id, delete the story identified by id
router.delete('/:id', controller.delete);


module.exports = router;