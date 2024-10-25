const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '172.18.192.1',      // Хост MySQL
    port: 3307,
    user: 'userAdmin',           // Користувач MySQL
    password: 'password',   // Пароль MySQL
    database: 'ratatouille',   // База даних
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ', err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = connection;
