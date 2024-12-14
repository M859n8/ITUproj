const express = require('express');
const cors = require('cors');
const connection = require('./db-config');

const app = express();
const PORT = 5000; 

app.use(cors());
app.use(express.json()); 

//----------------------------------------------------- Maryna------------------------------------------------------------------

app.post('/add-product', (req, res) => {
    const { 
        name, amount, unit, price, lactose_free, gluten_free, 
        vegan, expiration_date } = req.body;

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

app.delete('/delete-product/:productId', (req, res) => {
    const { productId } = req.params; // Отримуємо ID через params
    
    if (!productId) {
        return res.status(400).send('Please provide a valid product ID');
    }
  
    const query = `
      DELETE FROM products
      WHERE products.id = ?;
    `;
  
    connection.query(query, [productId], (err, results) => {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Failed to delete the product.' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      res.status(200).json({ message: 'Product deleted successfully.' });
    });
});

app.put('/update-product/:productId', (req, res) => {
    const { productId } = req.params;
    const {
      name, amount, unit, price, lactose_free, gluten_free, vegan,
      expiration_date,
    } = req.body;
    
  
    const query = `
      UPDATE products
      SET name = ?, amount = ?, unit = ?, price = ?, lactose_free = ?, gluten_free = ?, vegan = ?, expiration_date = ?
      WHERE id = ?;
    `;
  
    const values = [
      name, amount, unit, price,
      lactose_free, gluten_free,
      vegan, expiration_date,
      productId,
    ];
  
    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ error: 'Failed to update the product.' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
  
      res.status(200).json({ message: 'Product updated successfully.' });
    });
  });

  //-------------------------calendar-----------------------------//


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

    const findProductsForDishQuery = ` 
        SELECT dp.product_id, p.amount, p.reserved_amount, dp.required_amount 
        FROM dish_product dp JOIN products p ON dp.product_id = p.id 
        WHERE dp.dish_id = ?; 
    `; 
    const updateProductReservedAmountQuery = ` 
        UPDATE products SET reserved_amount = reserved_amount + ? WHERE id = ? 
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
        connection.query(findProductsForDishQuery, [dish_id], (err, products) => { 
            if (err) { 
                console.error('Error finding products for dish:', err); 
                return res.status(500).json({ error: 'Failed to find products for dish' }); 
            } 
            const insufficientProducts = products.filter(product => product.amount-product.reserved_amount < product.required_amount); 
            if (insufficientProducts.length > 0) { 
                return res.status(400).json({ error: 'Not enough products available', insufficientProducts }); 
            } else { 
                products.forEach(product => { 
                    connection.query(updateProductReservedAmountQuery, [product.required_amount, product.product_id], (err, results) => { 
                        if (err) { 
                            console.error('Error updating product reserved amount:', err); 
                            return res.status(500).json({ error: 'Failed to update product reserved amount' }); 
                        } 
                    }); 
                });
            
                connection.query(insertCalendarDishQuery, [calendar_id, dish_id, meal_type], (err, results) => { 
                    if (err) { console.error('Error planning meal:', err); 
                        return res.status(500).json({ error: 'Failed to plan meal' }); 
                    } 
                    res.status(201).json({ message: 'Meal planned successfully' }); 
                }); 
            } 
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

app.delete('/delete-planned-dish/:dishId', (req, res) => {
    const { dishId } = req.params;
    const { date, meal_type } = req.body;
  
    if (!dishId || !date || !meal_type) {
      return res.status(400).json({
        error: 'Dish ID, date, and meal type are required for deletion.',
      });
    }

    const findDishProductsQuery = ` 
        SELECT product_id, required_amount 
        FROM dish_product WHERE dish_id = ? 
    `; 
    const updateProductReservedAmountQuery = ` 
        UPDATE products 
        SET reserved_amount = reserved_amount - ? 
        WHERE id = ? 
    `;
  
    const deletePlannedDishQuery = `
      DELETE FROM calendar_dishes
      USING calendar_dishes
      INNER JOIN calendar ON calendar.id = calendar_dishes.calendar_id
      WHERE calendar.date = ? AND calendar_dishes.meal_type = ? AND calendar_dishes.dish_id = ?;
    `;

    // Спочатку знайдемо відповідні записи в таблиці dish_products 
    connection.query(findDishProductsQuery, [dishId], (err, products) => { 
        if (err) { 
            console.error('Error finding products for dish:', err); 
            return res.status(500).json({ error: 'Failed to find products for dish.' }); 
        }
  
    connection.query(deletePlannedDishQuery, [date, meal_type, dishId], (err, results) => {
      if (err) {
        console.error('Error deleting planned dish:', err);
        return res.status(500).json({ error: 'Failed to delete the dish.' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Dish not found.' });
      }

      // Оновлюємо резервовану кількість продуктів 
      products.forEach(product => { 
        connection.query(updateProductReservedAmountQuery, [product.required_amount, product.product_id], (err, results) => { 
            if (err) { 
                console.error('Error updating product reserved amount:', err); 
                return res.status(500).json({ error: 'Failed to update product reserved amount.' }); 
            } 
        }); 
    });
  
      res.status(200).json({ message: 'Dish deleted successfully.' });
    });
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

app.post('/update-dish', (req, res) => {
    const {
        name,
        difficulty_level,
        cooking_time,
        is_vegan,
        is_gluten_free,
        is_lactose_free,
        originalName
    } = req.body;

    // Формуємо запит для оновлення лише переданих полів
    const updates = [];
    const values = [];

    updates.push('name = ?');
    values.push(name);

    if (difficulty_level) {
        updates.push('difficulty_level = ?');
        values.push(difficulty_level);
    }

    if (cooking_time) {
        updates.push('cooking_time = ?');
        values.push(cooking_time);
    }

    // Завжди оновлюємо індикатори
    updates.push('is_vegan = ?');
    values.push(is_vegan);

    updates.push('is_gluten_free = ?');
    values.push(is_gluten_free);

    updates.push('is_lactose_free = ?');
    values.push(is_lactose_free);

    // Додаємо ім'я для WHERE
    values.push(originalName);

    if (updates.length === 0) {
        return res.status(400).send('No fields to update');
    }

    const updateQuery = `UPDATE dishes SET ${updates.join(', ')} WHERE name = ?`;

    connection.query(updateQuery, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating dish');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Dish not found');
        }

        res.status(200).send('Dish updated successfully');
    });
});

app.post('/update-dish-favorite', (req, res) => {
    const { name, is_favorite } = req.body;

    // if (!name || typeof is_favorite === 'undefined') {
    //     return res.status(400).send('Dish name and is_favorite value are required');
    // }

    // Перевіряємо, чи існує страва
    const getDishQuery = 'SELECT * FROM dishes WHERE name = ?';
    connection.query(getDishQuery, [name], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving dish');
        }

        if (results.length === 0) {
            return res.status(404).send('Dish not found');
        }

        // Оновлюємо значення is_favorite
        const updateQuery = 'UPDATE dishes SET is_favorite = ? WHERE name = ?';
        connection.query(updateQuery, [is_favorite, name], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating dish');
            }
            res.status(200).send('Dish favorite status updated');
        });
    });
});

app.get('/filter-dishes', (req, res) => {
    const { filter } = req.query;

    // Запит для отримання страв з фільтром
    const dishQuery = `
        SELECT * FROM dishes WHERE ?? = true
    `;

    connection.query(dishQuery, [filter], (err, dishResults) => {
        if (err) {
            return res.status(500).send('Error searching for dishes');
        }

        if (dishResults.length === 0) {
            return res.status(404).send('No dishes found');
        }

        // Отримання інгредієнтів для кожної страви
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

            // Об’єднання страв з їх інгредієнтами
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

        if (results.length > 0) { // ЧИ РОБИТИ ПЕРЕВІРКУ НАЯВНОСТІ ПРОДУКТА ТУТ ЧИ НІ
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
        } 
        // else {
        //     // Якщо продукт не знайдений, створюємо новий
        //     const addProductQuery = 'INSERT INTO products (name, amount) VALUES (?, ?)';
        //     connection.query(addProductQuery, [name, amount], (err) => {
        //         if (err) {
        //             return res.status(500).send('Error adding new product');
        //         }
        //         res.status(201).send('New product added');
        //     });
        // }
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
