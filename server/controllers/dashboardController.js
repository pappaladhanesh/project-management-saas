const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        let params = [];
        let projectFilter = '';
        let taskFilter = '';

        if (req.user.role !== 'Admin') {
            projectFilter = `WHERE id IN (SELECT project_id FROM project_members WHERE user_id = $1)`;
            taskFilter = `WHERE (assigned_to = $1 OR created_by = $1)`;
            params = [req.user.id];
        }

        const totalProjectsRes = await pool.query(`SELECT COUNT(*) FROM projects ${projectFilter}`, params);
        const totalTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks ${taskFilter}`, params);
        const completedTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks ${taskFilter ? taskFilter + ' AND' : 'WHERE'} status = 'Completed'`, params);

        const totalTasks = parseInt(totalTasksRes.rows[0].count);
        const completedTasks = parseInt(completedTasksRes.rows[0].count);
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        res.status(200).json({
            totalProjects: parseInt(totalProjectsRes.rows[0].count),
            totalTasks,
            completedTasks,
            completionRate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

exports.getChartData = async (req, res) => {
    try {
        let params = [];
        let filter = '';

        if (req.user.role !== 'Admin') {
            filter = `AND (assigned_to = $1 OR created_by = $1)`;
            params = [req.user.id];
        }

        // Get completed tasks grouped by date (last 7 days)
        const query = `
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM tasks 
            WHERE status = 'Completed' 
            AND created_at >= NOW() - INTERVAL '7 days'
            ${filter}
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at) ASC
        `;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        let query = `
            SELECT l.*, u.name as user_name, t.title as task_title 
            FROM task_activity_logs l 
            JOIN users u ON l.user_id = u.id 
            JOIN tasks t ON l.task_id = t.id 
        `;
        let params = [];

        if (req.user.role !== 'Admin') {
            query += ` WHERE t.assigned_to = $1 OR t.created_by = $1 `;
            params = [req.user.id];
        }

        query += ` ORDER BY l.created_at DESC LIMIT 10`;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};
