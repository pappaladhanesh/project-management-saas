const pool = require('../config/db');

exports.createProject = async (req, res) => {
    const { title, description, members } = req.body;

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        // 1. INSERT PROJECT
        const projectResult = await client.query(
            'INSERT INTO projects (title, description, created_by) VALUES ($1, $2, $3) RETURNING id',
            [title, description, req.user.id]
        );

        const projectId = projectResult.rows[0].id;

        // 2. AUTO ADD CREATOR
        await client.query(
            'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
            [projectId, req.user.id]
        );

        // 3. ADD MEMBERS
        if (members && Array.isArray(members)) {

            for (const memberId of members) {

                if (memberId !== req.user.id) {

                    await client.query(
                        'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
                        [projectId, memberId]
                    );
                }
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Project successfully created',
            projectId
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error(error);

        res.status(500).json({
            error: 'Failed to create project'
        });

    } finally {
        client.release();
    }
};

exports.getProjects = async (req, res) => {

    try {

        let query = '';
        let params = [];
        const { search, status } = req.query;

        let whereClauses = [];

        if (search) {
            whereClauses.push(`p.title ILIKE $${whereClauses.length + 1}`);
            params.push(`%${search}%`);
        }

        if (req.user.role === 'Admin') {

            let whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

            query = `
                SELECT p.* FROM projects p
                ${whereStr}
                ORDER BY p.created_at DESC
            `;

        } else {

            whereClauses.push(`pm.user_id = $${whereClauses.length + 1}`);
            params.push(req.user.id);

            let whereStr = `WHERE ${whereClauses.join(' AND ')}`;

            query = `
                SELECT p.*
                FROM projects p
                INNER JOIN project_members pm
                ON p.id = pm.project_id
                ${whereStr}
                ORDER BY p.created_at DESC
            `;

        }

        const result = await pool.query(query, params);

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve projects'
        });
    }
};

exports.updateProject = async (req, res) => {

    const { title, description } = req.body;

    try {

        await pool.query(
            'UPDATE projects SET title = $1, description = $2 WHERE id = $3',
            [title, description, req.params.id]
        );

        res.status(200).json({
            message: 'Project successfully updated'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to update project'
        });
    }
};

exports.deleteProject = async (req, res) => {

    try {

        await pool.query(
            'DELETE FROM projects WHERE id = $1',
            [req.params.id]
        );

        res.status(200).json({
            message: 'Project successfully deleted'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Failed to delete project'
        });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Check access if not Admin
        if (req.user.role !== 'Admin') {
            const accessCheck = await pool.query(
                'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
                [projectId, req.user.id]
            );
            if (accessCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
        
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = projectResult.rows[0];

        // Get members
        const membersResult = await pool.query(
            `SELECT u.id, u.name, u.email, u.role 
             FROM users u 
             JOIN project_members pm ON u.id = pm.user_id 
             WHERE pm.project_id = $1`,
            [projectId]
        );

        project.members = membersResult.rows;

        // Get tasks
        const tasksResult = await pool.query(
            `SELECT t.*, u.name as assigned_to_name 
             FROM tasks t 
             LEFT JOIN users u ON t.assigned_to = u.id 
             WHERE t.project_id = $1 ORDER BY t.created_at DESC`,
            [projectId]
        );
        
        project.tasks = tasksResult.rows;

        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve project details' });
    }
};

exports.addProjectMember = async (req, res) => {
    try {
        const { projectId, userId } = req.body;

        // Verify project exists
        const project = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
        if (project.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await pool.query(
            'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [projectId, userId]
        );

        res.status(200).json({ message: 'Member added to project' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add member' });
    }
};

exports.removeProjectMember = async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        await pool.query(
            'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
            [projectId, userId]
        );

        res.status(200).json({ message: 'Member removed from project' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
};