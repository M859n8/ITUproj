const express = require('express');
const cors = require('cors');
const connection = require('./db-config');

const app = express();
const PORT = 5000; 

app.use(cors());
app.use(express.json()); 

//----------------------------------------------- Maryna Kucher-----------------------------------------------------//
  //-------------------------product-----------------------------//

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
        amount || 0,
        unit || null,
        price || null,
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
    const { productId } = req.params; 
    
    if (!productId) {
        return res.status(400).send('Please provide a product ID');
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


//plan meal for a selected date
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
        SELECT 
            dp.product_id, 
            p.name,
            p.amount, 
            p.reserved_amount, 
            dp.required_amount,
            p.unit,
            p.price,
            p.lactose_free,
            p.gluten_free,
            p.vegan,
            p.expiration_date
        FROM 
            dish_product dp 
        JOIN 
            products p ON dp.product_id = p.id
        WHERE 
            dp.dish_id = ?;

    `; 
    const updateProductReservedAmountQuery = ` 
        UPDATE products SET reserved_amount = reserved_amount + ? WHERE id = ? 
    `;

    connection.query(findCalendarQuery, [date], (err, results) => {
        if (err) {
            console.error('Error finding calendar date:', err);
            return res.status(500).json({ error: 'Failed to find calendar date' });
        }

        if (results.length > 0) {
            //get id of the date, if it exists in table
            const existingCalendarId = results[0].id;
            addDishToCalendar(existingCalendarId);
        } else {
            //else add date to the table
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

    
    function addDishToCalendar(calendar_id) {
        connection.query(findProductsForDishQuery, [dish_id], (err, products) => { 
            if (err) { 
                console.error('Error finding products for dish:', err); 
                return res.status(500).json({ error: 'Failed to find products for dish' }); 
            } 
            const insufficientProducts = products.filter(product => product.amount-product.reserved_amount < product.required_amount); 
            if (insufficientProducts.length > 0) {
                return res.status(200).json({
                  message: 'Insufficient products to prepare this dish',
                  insufficientProducts,
                  suggestion: 'Please add the missing products to the inventory.',
                });
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
                    }else{
                    res.status(201).json({ message: 'Meal planned successfully' }); 


                    } 
                }); 
            } 
        }); 
    } 
});

app.post('/add-multiple-to-shopping-list', async (req, res) => {
    const { insufficientProducts, dish_id, date, meal_type } = req.body; 


    if (!insufficientProducts || !insufficientProducts.length) {
        console.error('No products received for adding to shopping list');
        return res.status(400).send('No products provided');
    }
  
    //each product processing
    const processProduct = (product) => {
      return new Promise((resolve, reject) => {
        const { name, amount = 0, reserved_amount = 0, required_amount = 0, unit = null, price = null, lactose_free, gluten_free, vegan, expiration_date = null } = product;
  
        const getProductQuery = 'SELECT * FROM shopping_list WHERE name = ?';
        connection.query(getProductQuery, [name], (err, results) => {
          if (err) return reject(`Error retrieving product: ${err}`);
  
          if (results.length > 0) {
            //product exists, upd amount
            const existingProduct = results[0];
            const newAmount = existingProduct.amount + required_amount;
  
            const updateQuery = 'UPDATE shopping_list SET amount = ? WHERE name = ?';
            connection.query(updateQuery, [newAmount, name], (err) => {
              if (err) return reject(`Error updating product quantity: ${err}`);
              resolve(`Product ${name} updated successfully`);
            });
          } else {
            //create product if does not exist
            const insertQuery = `
              INSERT INTO shopping_list (name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            connection.query(insertQuery, [name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date], (err) => {
              if (err) return reject(`Error adding product to shopping list: ${err}`);
              resolve(`Product ${name} added to shopping list`);
            });
          }
        });
      });
    };
  
    try {
        //execute ewerything in parallel
        const results = await Promise.all(insufficientProducts.map(processProduct));
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
            SELECT 
                dp.product_id, 
                p.name,
                p.amount, 
                p.reserved_amount, 
                dp.required_amount,
                p.unit,
                p.price,
                p.lactose_free,
                p.gluten_free,
                p.vegan,
                p.expiration_date
            FROM 
                dish_product dp 
            JOIN 
                products p ON dp.product_id = p.id
            WHERE 
                dp.dish_id = ?;

        `; 
        const updateProductReservedAmountQuery = ` 
            UPDATE products SET reserved_amount = reserved_amount + ? WHERE id = ? 
        `;

        connection.query(findCalendarQuery, [date], (err, results) => {
            if (err) {
              console.error('Error finding calendar date:', err);
              return res.status(500).json({ error: 'Failed to find calendar date' });
            }
      
            if (results.length > 0) {
              // date exists
              const existingCalendarId = results[0].id;
              addDishToCalendar(existingCalendarId);
            } else {
              //create new date
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
           //add dish to calendar
    function addDishToCalendar(calendar_id) {
        connection.query(findProductsForDishQuery, [dish_id], (err, products) => {
          if (err) {
            console.error('Error finding products for dish:', err);
            return res.status(500).json({ error: 'Failed to find products for dish' });
          }
            const sufficientProducts = products.filter(product => product.amount - product.reserved_amount >= product.required_amount);

            if (sufficientProducts.length > 0) {
                sufficientProducts.forEach(product => {
                    connection.query(updateProductReservedAmountQuery, [product.required_amount, product.product_id], (err) => {
                    if (err) {
                        console.error('Error updating product reserved amount:', err);
                        return res.status(500).json({ error: 'Failed to update product reserved amount' });
                    }
                    });
                });
            }
  
            connection.query(insertCalendarDishQuery, [calendar_id, dish_id, meal_type], (err) => {
              if (err) {
                console.error('Error planning meal:', err);
                return res.status(500).json({ error: 'Failed to plan meal' });
              } else {
                res.status(201).json({ message: 'Meal planned successfully', details: results });
              }
            });
          
        });
    }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing products', details: error });
    }
  });
  
 

app.get('/meals-for-day', (req, res) => {
    const { date, meal_type } = req.query;

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

    connection.query(query, [date, meal_type], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while retrieving meals.' });
        }
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

      //update reserved products amount
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
// ---------------------DISH------------------
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

    // Form a request to update only the transferred fields
    const updates = [];
    const values = [];

    if (name) {
        updates.push('name = ?');
        values.push(name);
    }

    if (difficulty_level) {
        updates.push('difficulty_level = ?');
        values.push(difficulty_level);
    }

    if (cooking_time) {
        updates.push('cooking_time = ?');
        values.push(cooking_time);
    }

    const isVegan = is_vegan === 'on' ? 1 : 0;
    const isGlutenFree = is_gluten_free === 'on' ? 1 : 0;
    const isLactoseFree = is_lactose_free === 'on' ? 1 : 0;
    // Always update indicators
    updates.push('is_vegan = ?');
    values.push(isVegan);

    updates.push('is_gluten_free = ?');
    values.push(isGlutenFree);

    updates.push('is_lactose_free = ?');
    values.push(isLactoseFree);

    // Add old dish name for WHERE
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
            return res.status(404).send('Dish was not found');
        }

        res.status(200).send('Dish updated successfully');
    });
});

app.post('/update-dish-favorite', (req, res) => {
    const { name, is_favorite } = req.body;

    // Check if dish exist
    const getDishQuery = 'SELECT * FROM dishes WHERE name = ?';
    connection.query(getDishQuery, [name], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving dish');
        }

        if (results.length === 0) {
            return res.status(404).send('Dish not found');
        }

        // Update value of 'is_favorite'
        const updateQuery = 'UPDATE dishes SET is_favorite = ? WHERE name = ?';
        connection.query(updateQuery, [is_favorite, name], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating dish');
            }
            res.status(200).send('Dish attribute is_favorite updated');
        });
    });
});

app.get('/filter-dishes', (req, res) => {
    const { filter } = req.query;

    // Get all dish with filter
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

        // Get product connected to this dish
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
// ---------------------SHOPPING LIST------------------
app.post('/add-to-shopping-list', (req, res) => {
    const { name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date } = req.body;

    const query = `
        INSERT INTO shopping_list (name, amount, unit, price, lactose_free, gluten_free, vegan, expiration_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [name, amount || 0, unit || null, price || null, lactose_free, gluten_free, vegan, expiration_date || null];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error adding item to shopping list');
        }
        res.status(201).send('Product added to shopping list');
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
        res.status(200).json(results); 
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
            const existingProduct = results[0];
            const newAmount = existingProduct.amount + amount;  

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
