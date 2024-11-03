const express = require('express');
const cors = require('cors');
const connection = require('./db-config');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Для парсингу JSON

//----------------------------------------------------- Maryna------------------------------------------------------------------
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
            return res.status(500).send('Error searching for the item in the database');
        }
        if (results.length === 0) {
            return res.status(404).send('Item not found');
        }
        res.status(200).json(results);
    });

});

app.get('/get-all-product', (req, res) => {

    // Запит до бази даних з пошуком за назвою
    const query = 'SELECT * FROM products ';
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error searching for the item in the database');
        }
        if (results.length === 0) {
            return res.status(404).send('Item not found');
        }
        res.status(200).json(results);
    });

});
//----------------------------------------------------- Vlada------------------------------------------------------------------
app.post('/add-dish', (req, res) => {
    const { name, difficulty_level, cooking_time, is_vegan, is_gluten_free, is_lactose_free, ingredients } = req.body;

    // Створюємо страву
    const query = 'INSERT INTO dishes (name, difficulty_level, cooking_time, is_vegan, is_gluten_free, is_lactose_free) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [name, difficulty_level, cooking_time, is_vegan, is_gluten_free, is_lactose_free], (err, results) => {
        if (err) {
            return res.status(500).send('Error creating the dish');
        }

        const dishId = results.insertId;

        // Додаємо зв'язки в таблицю dish_product
        const dishProductQueries = ingredients.map(ingredient => {
            return new Promise((resolve, reject) => {
                const insertQuery = 'INSERT INTO dish_product (dish_id, product_id, required_amount) VALUES (?, ?, ?)';
                connection.query(insertQuery, [dishId, ingredient.productId, ingredient.requiredAmount], (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });

        Promise.all(dishProductQueries)
            .then(() => {
                res.status(201).send('Dish created successfully');
            })
            .catch((error) => {
                res.status(500).send('Error adding ingredients to the dish');
            });
    });
});

app.get('/', (req, res) => {
    res.send('Hell from backend!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
