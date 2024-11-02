const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '192.168.56.1',      // Хост MySQL
    user: 'app',           // Користувач MySQL
    password: 'mealApp',   // Пароль MySQL
    database: 'AppName',   // База даних
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
