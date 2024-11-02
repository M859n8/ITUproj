const express = require('express');
const cors = require('cors');
const connection = require('./db-config');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Для парсингу JSON

// Маршрут для додавання пункту до списку
app.post('/add-product', (req, res) => {
    const { name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date } = req.body;

    const query = `
        INSERT INTO products (name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        amount,
        unit,
        price,
        lactose_free,
        gluten_free,
        vegan,
        expiration_date || null  // передаємо NULL, якщо expiration_date не задано
    ];

    connection.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).send('Error adding item to the database');
        }
        res.status(201).send('Item added successfully');
    });
});

app.get('/get-product', (req, res) => {
    const { name } = req.query;

    // Перевіряємо, чи переданий параметр
    if (!name) {
        return res.status(400).send('Please provide a name to search for');
    }

    // Запит до бази даних з пошуком за назвою
    const query = 'SELECT * FROM products WHERE name LIKE ?';
    connection.query(query, [`%${name}%`], (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).send('Error fetching products from the database');
        }
        res.json(results); // Повертаємо всі знайдені об'єкти
    });

});


app.get('/', (req, res) => {
    res.send('Hell from backend!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
