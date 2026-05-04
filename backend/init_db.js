const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Reading database.sql...');
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

        console.log('Executing SQL...');
        await connection.query(sql);
        
        console.log('Database and tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error executing SQL:', err);
        process.exit(1);
    }
}

initDb();
