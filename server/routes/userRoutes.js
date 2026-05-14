const express = require('express');
const { getUsers, deleteUser, updateUserRole } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.get('/', verifyToken, requireRole(['Admin']), getUsers);
router.delete('/:id', verifyToken, requireRole(['Admin']), deleteUser);
router.put('/:id/role', verifyToken, requireRole(['Admin']), updateUserRole);

module.exports = router;
