const connection = require('./db-config');

// Створення бази даних і таблиці
const createDatabaseAndTables = `
CREATE DATABASE IF NOT EXISTS AppName;
USE AppName;

CREATE TABLE IF NOT EXISTS list_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
`;

connection.query(createDatabaseAndTables, (err, results) => {
    if (err) {
        console.error('Error creating database or tables:', err);
    } else {
        console.log('Database and tables created or verified');
    }
    connection.end();
});
