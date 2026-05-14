const pool = require('../config/db');

// CREATE TASK
exports.createTask = async (req, res) => {

    const {
        title,
        description,
        priority,
        due_date,
        assigned_to,
        project_id
    } = req.body;

    try {

        const result = await pool.query(
            `INSERT INTO tasks
            (title, description, priority, due_date, assigned_to, project_id, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
                title,
                description,
                priority,
                due_date,
                assigned_to,
                project_id,
                req.user.id
            ]
        );

        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.rows[0].id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to create task'
        });
    }
};

// GET TASKS
exports.getTasks = async (req, res) => {
    try {
        let query = '';
        let params = [];
        const { search, status, priority, project_id, sort_by } = req.query;

        let whereClauses = [];

        if (search) {
            whereClauses.push(`t.title ILIKE $${whereClauses.length + 1}`);
            params.push(`%${search}%`);
        }
        if (status) {
            whereClauses.push(`t.status = $${whereClauses.length + 1}`);
            params.push(status);
        }
        if (priority) {
            whereClauses.push(`t.priority = $${whereClauses.length + 1}`);
            params.push(priority);
        }
        if (project_id) {
            whereClauses.push(`t.project_id = $${whereClauses.length + 1}`);
            params.push(project_id);
        }

        // Add role-based filtering
        if (req.user.role !== 'Admin') {
            whereClauses.push(`(t.assigned_to = $${whereClauses.length + 1} OR t.created_by = $${whereClauses.length + 1})`);
            params.push(req.user.id);
        }

        let whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        
        let orderStr = 'ORDER BY t.due_date ASC NULLS LAST';
        if (sort_by === 'newest') orderStr = 'ORDER BY t.created_at DESC';
        if (sort_by === 'priority') orderStr = "ORDER BY CASE t.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END ASC";

        query = `
            SELECT t.*, u.name as assigned_to_name, p.title as project_title 
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN projects p ON t.project_id = p.id
            ${whereStr}
            ${orderStr}
        `;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
    const { status, priority, due_date, assigned_to, title, description } = req.body;
    const taskId = req.params.id;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const taskResult = await client.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
            
            if (taskResult.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const oldTask = taskResult.rows[0];

            // Verify permissions: Member can only update their own tasks, or they can only update status if assigned
            if (req.user.role !== 'Admin') {
                if (oldTask.assigned_to !== req.user.id && oldTask.created_by !== req.user.id) {
                    return res.status(403).json({ error: 'You can only update your own tasks' });
                }
            }

            // Build update query dynamically
            let updates = [];
            let params = [];
            let paramIndex = 1;
            
            const logActivity = async (action_type, old_val, new_val) => {
                if (old_val !== new_val) {
                    await client.query(
                        'INSERT INTO task_activity_logs (task_id, user_id, action_type, old_value, new_value) VALUES ($1, $2, $3, $4, $5)',
                        [taskId, req.user.id, action_type, old_val ? String(old_val) : null, new_val ? String(new_val) : null]
                    );
                }
            };

            if (status !== undefined) {
                updates.push(`status = $${paramIndex++}`);
                params.push(status);
                await logActivity('STATUS_CHANGE', oldTask.status, status);
            }
            if (priority !== undefined) {
                updates.push(`priority = $${paramIndex++}`);
                params.push(priority);
                await logActivity('PRIORITY_CHANGE', oldTask.priority, priority);
            }
            if (due_date !== undefined) {
                updates.push(`due_date = $${paramIndex++}`);
                params.push(due_date);
            }
            if (assigned_to !== undefined) {
                updates.push(`assigned_to = $${paramIndex++}`);
                params.push(assigned_to);
                await logActivity('ASSIGNEE_CHANGE', oldTask.assigned_to, assigned_to);
            }
            if (title !== undefined) {
                updates.push(`title = $${paramIndex++}`);
                params.push(title);
            }
            if (description !== undefined) {
                updates.push(`description = $${paramIndex++}`);
                params.push(description);
            }

            if (updates.length > 0) {
                params.push(taskId);
                await client.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);
            }

            await client.query('COMMIT');
            
            // Emit socket event if task belongs to a project
            if (oldTask.project_id) {
                const io = req.app.get('io');
                if (io) {
                    io.to(`project_${oldTask.project_id}`).emit('task_updated', {
                        taskId,
                        projectId: oldTask.project_id
                    });
                }
            }

            res.status(200).json({ message: 'Task updated successfully' });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: 'Task successfully deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

// GET TASK COMMENTS
exports.getTaskComments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, u.name as user_name 
             FROM task_comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.task_id = $1 
             ORDER BY c.created_at DESC`,
            [req.params.id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get comments' });
    }
};

// ADD TASK COMMENT
exports.addTaskComment = async (req, res) => {
    const { content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO task_comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.params.id, req.user.id, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

// GET TASK ACTIVITY LOGS
exports.getTaskLogs = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT l.*, u.name as user_name 
             FROM task_activity_logs l 
             JOIN users u ON l.user_id = u.id 
             WHERE l.task_id = $1 
             ORDER BY l.created_at DESC`,
            [req.params.id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get logs' });
    }
};

// UPLOAD ATTACHMENT
exports.uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return res.status(500).json({ error: 'Cloudinary is not configured on the server.' });
        }

        const taskId = req.params.id;
        const fileUrl = req.file.path; // Cloudinary URL
        const fileName = req.file.originalname;
        const fileType = req.file.mimetype;

        const result = await pool.query(
            'INSERT INTO task_attachments (task_id, user_id, file_url, file_name, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [taskId, req.user.id, fileUrl, fileName, fileType]
        );

        // Emit socket event for real-time update
        const taskResult = await pool.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
        if (taskResult.rows.length > 0 && taskResult.rows[0].project_id) {
            const io = req.app.get('io');
            if (io) io.to(`project_${taskResult.rows[0].project_id}`).emit('task_updated', { taskId });
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Failed to upload attachment' });
    }
};

// GET ATTACHMENTS
exports.getAttachments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, u.name as uploader_name 
             FROM task_attachments a 
             JOIN users u ON a.user_id = u.id 
             WHERE a.task_id = $1 
             ORDER BY a.created_at DESC`,
            [req.params.id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch attachments' });
    }
};

// DELETE ATTACHMENT
exports.deleteAttachment = async (req, res) => {
    try {
        const attachmentId = req.params.attachmentId;
        
        // Ensure user has permission
        if (req.user.role !== 'Admin') {
            const attResult = await pool.query('SELECT user_id FROM task_attachments WHERE id = $1', [attachmentId]);
            if (attResult.rows.length === 0 || attResult.rows[0].user_id !== req.user.id) {
                return res.status(403).json({ error: 'You can only delete your own attachments' });
            }
        }

        const deleted = await pool.query('DELETE FROM task_attachments WHERE id = $1 RETURNING task_id', [attachmentId]);
        
        if (deleted.rows.length > 0) {
            const taskId = deleted.rows[0].task_id;
            const taskResult = await pool.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
            if (taskResult.rows.length > 0 && taskResult.rows[0].project_id) {
                const io = req.app.get('io');
                if (io) io.to(`project_${taskResult.rows[0].project_id}`).emit('task_updated', { taskId });
            }
        }

        res.status(200).json({ message: 'Attachment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete attachment' });
    }
};