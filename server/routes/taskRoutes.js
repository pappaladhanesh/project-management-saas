const express = require('express');
const { 
    createTask, 
    getTasks, 
    updateTask, 
    deleteTask,
    getTaskComments,
    addTaskComment,
    getTaskLogs,
    uploadAttachment,
    getAttachments,
    deleteAttachment
} = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.post('/', verifyToken, requireRole(['Admin']), createTask);
router.get('/', verifyToken, getTasks);
router.put('/:id', verifyToken, updateTask); 
router.delete('/:id', verifyToken, requireRole(['Admin']), deleteTask);

// Comments and Logs
router.get('/:id/comments', verifyToken, getTaskComments);
router.post('/:id/comments', verifyToken, addTaskComment);
router.get('/:id/logs', verifyToken, getTaskLogs);

// Attachments
router.get('/:id/attachments', verifyToken, getAttachments);
router.post('/:id/attachments', verifyToken, upload.single('file'), uploadAttachment);
router.delete('/attachments/:attachmentId', verifyToken, deleteAttachment);

module.exports = router;