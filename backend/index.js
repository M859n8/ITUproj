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

app.post('/add-to-shopping-list', (req, res) => {
    const { name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date } = req.body;

    const query = `
        INSERT INTO shopping_list (name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date || null];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error adding item to shopping list');
        }
        res.status(201).send('Item added to shopping list');
    });
});

app.get('/get-product-from-list/:name', (req, res) => {
    const name = req.params.name;

    const query = `SELECT * FROM shopping_list WHERE name = ?`;
    
    connection.query(query, [name], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving product from the shopping list');
        }
        if (results.length === 0) {
            return res.status(404).send('Product not found');
        }
        res.status(200).json(results); // Повертаємо перший знайдений продукт
    });
});

app.get('/get-all-shopping-list', (req, res) => {
    const query = 'SELECT * FROM shopping_list';
    
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving shopping list');
        }

        res.status(200).json(results);
    });
});

app.post('/update-product-amount', (req, res) => {
    const { name, amount } = req.body;

    const getProductQuery = 'SELECT * FROM products WHERE name = ?';
    connection.query(getProductQuery, [name], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving product');
        }

        if (results.length > 0) {
            // Оновлюємо кількість існуючого продукту
            const existingProduct = results[0];
            const newAmount = existingProduct.amount + amount;  // додаємо до поточної кількості

            const updateQuery = 'UPDATE products SET amount = ? WHERE name = ?';
            connection.query(updateQuery, [newAmount, name], (err) => {
                if (err) {
                    return res.status(500).send('Error updating product quantity');
                }
                res.status(200).send('Product quantity updated');
            });
        } else {
            // Якщо продукт не знайдений, створюємо новий
            const addProductQuery = 'INSERT INTO products (name, amount) VALUES (?, ?)';
            connection.query(addProductQuery, [name, amount], (err) => {
                if (err) {
                    return res.status(500).send('Error adding new product');
                }
                res.status(201).send('New product added');
            });
        }
    });
});

app.delete('/delete-from-shopping-list', (req, res) => {
    const { name } = req.body;

    const deleteQuery = 'DELETE FROM shopping_list WHERE name = ?';
    connection.query(deleteQuery, [name], (err, results) => {
        if (err) {
            return res.status(500).send('Error deleting product from shopping list');
        }
        res.status(200).send('Product removed from shopping list');
    });
});

app.post('/update-product-from-list', (req, res) => {
    const { name, amount } = req.body;

    const query = `UPDATE shopping_list SET amount = ? WHERE name = ?`;
    connection.query(query, [amount, name], (err, results) => {
        if (err) {
            return res.status(500).send('Error updating product');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Product not found');
        }
        res.status(200).send('Product updated successfully');
    });
});


// Starting server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
