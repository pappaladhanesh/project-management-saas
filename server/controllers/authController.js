const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {

    const { name, email, password } = req.body;

    try {

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email and password are required'
            });
        }

        // CHECK EXISTING USER
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: 'Email already exists'
            });
        }

        // HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // INSERT USER
        await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
            [name, email, hashedPassword, 'Member']
        );

        res.status(201).json({
            message: 'User registered successfully'
        });

    } catch (error) {

        console.error('REGISTER ERROR:', error);

        res.status(500).json({
            error: 'Server error during registration'
        });
    }
};

exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid Email or Password'
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid Email or Password'
            });
        }

        const payload = {
            id: user.id,
            role: user.role,
            name: user.name
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: payload
        });

    } catch (error) {

        console.error('LOGIN ERROR:', error);

        res.status(500).json({
            error: 'Server error during login'
        });
    }
};