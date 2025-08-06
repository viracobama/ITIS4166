const {body, validationResult} = require('express-validator');
const { isISO8601, isAfter } = require('validator');

const categories = ['Clubbing', 'Concert', 'Festival', 'Party', 'Other'];

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignUp = [
  body('firstName', 'First name is required').notEmpty().trim().escape(),
  body('lastName', 'Last name is required').notEmpty().trim().escape(),
  body('email')
  .custom((value) => {
    if (!value || value.trim() === '') {
      throw new Error('Email is required');
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      throw new Error('Email is not valid');
    }
    return true;
  })
  .trim()
  .escape()
  .normalizeEmail(),
  body('password', 'Password must be at least 8 characters and at most 64 characters')
    .isLength({ min: 8, max: 64 }).trim(),
];


exports.validateLogIn = [body('email', 'Email is not valid').isEmail().trim().escape().normalizeEmail(),
 body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64}).trim()];


exports.validateResult = (fallbackPath) => (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect(req.get('referer') || fallbackPath);
    } else {
        return next();
    }
};




exports.validateEvent = [body('category', 'Category is can only be Clubbing, Concert, Festival, Party or Other').trim().isIn(categories),
    body('title', 'Title is required').notEmpty().trim().escape(),
    body('details', 'Details is required').notEmpty().trim().escape(),
    body('location', 'Location is required').notEmpty().trim().escape(),
    body('start', 'Start date is required')
    .trim()
    .custom((value) => {
      if (!isISO8601(value)) {
        throw new Error('The format of start is not valid');
      }
      const now = new Date().toISOString();
      if (!isAfter(value, now)) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
    body('end', 'End date is required')
    .trim()
    .custom((value, { req }) => {
      if (!isISO8601(value)) {
        throw new Error('The format of end is not valid');
      }
      const startDate = new Date(req.body.start);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after the start date');
      }
      return true;
    }),
    body('banner', 'Invalid file').optional().trim().escape()
];