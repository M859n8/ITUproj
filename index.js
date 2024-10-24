const express = require('express');
const connection = require('./db-config');

const app = express();
const PORT = 3000;

app.use(express.json()); // Для парсингу JSON

// Маршрут для додавання пункту до списку
app.post('/add-item', (req, res) => {
    const { name } = req.body;
    const query = 'INSERT INTO list_items (name) VALUES (?)';

    connection.query(query, [name], (err, results) => {
        if (err) {
            return res.status(500).send('Error adding item to the database');
        }
        res.status(201).send('Item added successfully');
    });
});

app.get('/', (req, res) => {
    res.send('API працює. Використовуйте маршрути /products для роботи з продуктами.');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
