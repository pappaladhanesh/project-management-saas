const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function setupDB() {
    try {
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await pool.query(schema);
        console.log('Schema executed successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error executing schema:', error);
        process.exit(1);
    }
}

setupDB();
