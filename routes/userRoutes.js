const express = require('express');
const router = express.Router();

const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middleware/auth');
const { logInLimiter } = require('../middleware/rateLimiters');
const { validateSignUp, validateLogIn, validateResult } = require('../middleware/validator');

// GET /users/new: show sign-up form
router.get('/new', isGuest, controller.new);

// POST /users: create new user
router.post(
  '/',
  isGuest,
  validateSignUp,
  validateResult('/users/new'),
  controller.create
);

// GET /users/login: show login form
router.get('/login', isGuest, controller.getUserLogin);

// POST /users/login: handle login
router.post(
  '/login',
  logInLimiter,
  isGuest,
  validateLogIn,
  validateResult('/users/login'),
  controller.login
);

// GET /users/profile: show profile
router.get('/profile', isLoggedIn, controller.profile);

// GET /users/logout: logout user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
