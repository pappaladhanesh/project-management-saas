const pool = require('../config/db');

// GET USERS
exports.getUsers = async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error('Failed to fetch users:', error);

        res.status(500).json({
            error: 'Failed to retrieve users'
        });
    }
};

// DELETE USER
exports.deleteUser = async (req, res) => {

    try {

        // PREVENT SELF DELETE
        if (parseInt(req.params.id) === req.user.id) {

            return res.status(400).json({
                error: 'You cannot delete your own account'
            });
        }

        await pool.query(
            'DELETE FROM users WHERE id = $1',
            [req.params.id]
        );

        res.status(200).json({
            message: 'User deleted successfully'
        });

    } catch (error) {

        console.error('Failed to delete user:', error);

        res.status(500).json({
            error: 'Failed to delete user'
        });
    }
};

// UPDATE ROLE
exports.updateUserRole = async (req, res) => {

    const { role } = req.body;

    if (!['Admin', 'Member'].includes(role)) {

        return res.status(400).json({
            error: 'Role must be Admin or Member'
        });
    }

    try {

        await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2',
            [role, req.params.id]
        );

        res.status(200).json({
            message: 'User role updated successfully'
        });

    } catch (error) {

        console.error('Failed to update user role:', error);

        res.status(500).json({
            error: 'Failed to update user role'
        });
    }
};