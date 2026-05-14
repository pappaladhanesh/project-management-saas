const express = require('express');
const { 
    createProject, 
    getProjects, 
    updateProject, 
    deleteProject,
    getProjectById,
    addProjectMember,
    removeProjectMember
} = require('../controllers/projectController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.post('/', verifyToken, requireRole(['Admin']), createProject);
router.get('/', verifyToken, getProjects);
router.get('/:id', verifyToken, getProjectById);
router.put('/:id', verifyToken, requireRole(['Admin']), updateProject);
router.delete('/:id', verifyToken, requireRole(['Admin']), deleteProject);

// Member management
router.post('/members', verifyToken, requireRole(['Admin']), addProjectMember);
router.delete('/:projectId/members/:userId', verifyToken, requireRole(['Admin']), removeProjectMember);

module.exports = router;