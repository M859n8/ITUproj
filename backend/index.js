const express = require('express');
const cors = require('cors');
const connection = require('./db-config');

const app = express();
const PORT = 5000; 

app.use(cors());
app.use(express.json()); 

//----------------------------------------------------- Maryna------------------------------------------------------------------

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
        expiration_date || null  
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

    if (!name) {
        return res.status(400).send('Please provide a name to search for');
    }

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

// Планування страви на конкретний день
app.post('/plan-meal', (req, res) => {
    const { date, dish_id, meal_type } = req.body;

    const findCalendarQuery = `
        SELECT id FROM calendar WHERE date = ?
    `;
    const insertCalendarQuery = `
        INSERT INTO calendar (date) VALUES (?)
    `;
    const insertCalendarDishQuery = `
        INSERT INTO calendar_dishes (calendar_id, dish_id, meal_type)
        VALUES (?, ?, ?)
    `;

    // Перевірка, чи існує дата в таблиці `calendar`
    connection.query(findCalendarQuery, [date], (err, results) => {
        if (err) {
            console.error('Error finding calendar date:', err);
            return res.status(500).json({ error: 'Failed to find calendar date' });
        }

        if (results.length > 0) {
            // Якщо дата існує, беремо `id`
            const existingCalendarId = results[0].id;
            addDishToCalendar(existingCalendarId);
        } else {
            // Якщо дати немає, додаємо її в таблицю
            connection.query(insertCalendarQuery, [date], (err, results) => {
                if (err) {
                    console.error('Error inserting calendar date:', err);
                    return res.status(500).json({ error: 'Failed to insert calendar date' });
                }
                const newCalendarId = results.insertId;
                addDishToCalendar(newCalendarId);
            });
        }
    });

    // Додаємо страву до календаря
    function addDishToCalendar(calendar_id) {
        connection.query(insertCalendarDishQuery, [calendar_id, dish_id, meal_type], (err, results) => {
            if (err) {
                console.error('Error planning meal:', err);
                return res.status(500).json({ error: 'Failed to plan meal' });
            }
            res.status(201).json({ message: 'Meal planned successfully' });
        });
    }
});


app.get('/meals-for-day', (req, res) => {
    // Отримуємо обраний день з query-параметра (наприклад, ?date=2024-12-05)
    const { date, meal_type } = req.query;


    // console.log('Received date:', date);
    // console.log('Received mealType:', meal_type);

    // Перевіряємо, чи передано дату та тип прийому їжі
    if (!date || !meal_type) {
        return res.status(400).json({ error: 'Please provide a valid date and meal_type (breakfast, lunch, dinner).' });
    }

    const query = `
        SELECT dishes.*
        FROM calendar_dishes
        INNER JOIN calendar ON calendar.id = calendar_dishes.calendar_id
        INNER JOIN dishes ON dishes.id = calendar_dishes.dish_id
        WHERE calendar.date = ? AND calendar_dishes.meal_type = ?;
    `;

    // Виконуємо запит до бази даних
    connection.query(query, [date, meal_type], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while retrieving meals.' });
        }
        // console.log('Query Results:', results);  // Логування результатів
        res.json(results);
    });
});

//----------------------------------------------------- Vlada------------------------------------------------------------------
app.post('/add-dish', (req, res) => {
    const { name, difficulty_level, cooking_time, is_vegan, is_gluten_free, is_lactose_free, ingredients } = req.body;

    // Create dish
    const query = 'INSERT INTO dishes (name, difficulty_level, cooking_time, is_vegan, is_gluten_free, is_lactose_free) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [name, difficulty_level, cooking_time, is_vegan, is_gluten_free, is_lactose_free], (err, results) => {
        if (err) {
            return res.status(500).send('Error creating the dish');
        }

        const dishId = results.insertId;

        // Add connection to the table dish_product
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

app.get('/get-dish', (req, res) => {
    const { name } = req.query;

    // Search dish
    const dishQuery = 'SELECT * FROM dishes WHERE name LIKE ?';
    connection.query(dishQuery, [`%${name}%`], (err, dishResults) => {
        if (err) {
            return res.status(500).send('Error searching for the dish');
        }

        if (dishResults.length === 0) {
            return res.status(404).send('No dishes found');
        }

        // Get the product of the dish
        const dishIds = dishResults.map(dish => dish.id);
        const ingredientQuery = `
            SELECT dp.dish_id, p.name AS product_name, dp.required_amount, p.unit
            FROM dish_product dp
            JOIN products p ON dp.product_id = p.id
            WHERE dp.dish_id IN (?)
        `;

        connection.query(ingredientQuery, [dishIds], (err, ingredientResults) => {
            if (err) {
                return res.status(500).send('Error retrieving ingredients');
            }

            // Creating map of dish with their product
            const dishesWithIngredients = dishResults.map(dish => {
                return {
                    ...dish,
                    ingredients: ingredientResults.filter(ingredient => ingredient.dish_id === dish.id)
                };
            });

            res.status(200).json(dishesWithIngredients);
        });
    });
});

app.get('/get-all-dishes', (req, res) => {
    const dishQuery = 'SELECT * FROM dishes'; // Get all dish

    connection.query(dishQuery, (err, dishResults) => {
        if (err) {
            return res.status(500).send('Error retrieving dishes');
        }

        if (dishResults.length === 0) {
            return res.status(404).send('No dishes found');
        }

        // Get id of dish
        const dishIds = dishResults.map(dish => dish.id);
        
        // Get all product for the dishes
        const ingredientQuery = `
            SELECT dp.dish_id, p.name AS product_name, dp.required_amount, p.unit
            FROM dish_product dp
            JOIN products p ON dp.product_id = p.id
            WHERE dp.dish_id IN (?)
        `;

        connection.query(ingredientQuery, [dishIds], (err, ingredientResults) => {
            if (err) {
                return res.status(500).send('Error retrieving ingredients');
            }

            // Creating map of dish with their product
            const dishesWithIngredients = dishResults.map(dish => {
                return {
                    ...dish,
                    ingredients: ingredientResults.filter(ingredient => ingredient.dish_id === dish.id)
                };
            });

            res.status(200).json(dishesWithIngredients); 
        });
    });
});

app.delete('/delete-dish/:id', (req, res) => {
    const { id } = req.params;

    // Delete connection in table dish_product
    const deleteDishProductQuery = 'DELETE FROM dish_product WHERE dish_id = ?';
    connection.query(deleteDishProductQuery, [id], (err) => {
        if (err) {
            return res.status(500).send('Error deleting dish ingredients');
        }

        // Delete dish
        const deleteDishQuery = 'DELETE FROM dishes WHERE id = ?';
        connection.query(deleteDishQuery, [id], (err) => {
            if (err) {
                return res.status(500).send('Error deleting the dish');
            }

            res.status(200).send('Dish deleted successfully');
        });
    });
});


// Starting server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
