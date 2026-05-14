const express = require('express');
const { check, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per window
    message: { error: 'Too many login attempts, please try again later' }
});

// Middleware to catch validation errors and send them to the frontend
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};

// Strict Validation Rules applied to the Registration Route
router.post('/register', authLimiter, [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validateRequest, register);

// Login User
router.post('/login', authLimiter, [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], validateRequest, login);

module.exports = router;