const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required')
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation rules
const profileUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  body('preferences.categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('preferences.categories.*')
    .optional()
    .isIn(['news', 'reviews', 'features', 'motorsport', 'technology', 'electric'])
    .withMessage('Invalid category'),
  body('preferences.sources')
    .optional()
    .isArray()
    .withMessage('Sources must be an array'),
  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean')
];

// Register user
// POST /api/auth/register
router.post('/register', registerValidation, register);

// Login user
// POST /api/auth/login
router.post('/login', loginValidation, login);

// Get current user profile (protected)
// GET /api/auth/profile
router.get('/profile', auth, getProfile);

// Update user profile (protected)
// PUT /api/auth/profile
router.put('/profile', auth, profileUpdateValidation, updateProfile);

module.exports = router;