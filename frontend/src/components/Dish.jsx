/* Autor: Bilyk Vladyslava */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dish.css'; 

// Representation of Dish section
const Dish = () => {
    // Search result
    const [searchQuery, setSearchQuery] = useState('');
    // Array of all dishes
    const [dishes, setDishes] = useState([]);
    // Errors
    const [errorSearch, setErrorSearch] = useState('');
    //  Variable that save form state - open or close
    const [isFormOpen, setIsFormOpen] = useState(false);
    // FORM
    const [dishName, setDishName] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('easy');
    const [cookingTime, setCookingTime] = useState('');
    const [isVegan, setIsVegan] = useState(false);
    const [isGlutenFree, setIsGlutenFree] = useState(false);
    const [isLactoseFree, setIsLactoseFree] = useState(false);
    // Array of product ingredient for new dish
    const [ingredients, setIngredients] = useState([]);
    // Search product in form for ingredient
    const [searchProduct, setSearchProduct] = useState('');
    // Array of product that was found for ingredient
    const [foundProducts, setFoundProducts] = useState([]);
    // EDIT
    // Dish name that user want to update
    const [editingDishName, setEditingDishName] = useState(null);
    // New value for update
    const [editDish, setEditDish] = useState({
        name: '',
        difficulty_level: 'easy',
        cooking_time: '',
        is_vegan: false,
        is_gluten_free: false,
        is_lactose_free: false,
    });
    // FILTER
    const [selectedFilter, setSelectedFilter] = useState('');
    // Check what dish user want to add to meal plan
    const [dishCalendar, setDishCalendar] = useState('null'); 
    const [formDataCalendar, setFormDataCalendar] = useState({
      date: '',
      mealType: 'breakfast', 
    });

    // Function that fill variable 'editDish' with new value for updating
    const handleEditValue = (field, value) => {
        setEditDish(prev => ({ ...prev, [field]: value }));
    };

    // Open and close form function
    const toggleForm = () => {
        setIsFormOpen(!isFormOpen);
    };

    // Function for showing all dishes
    const fetchDishes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-all-dishes');
            if (Array.isArray(response.data)) {
                setDishes(response.data);
            } else { // If there no dish in table Dish
                setDishes([]);
            }
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

    useEffect(() => {
        fetchDishes(); // Retrieve dishes when the component loads
    }, []);

    // Function that handle deleting dish from table Dish
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/delete-dish/${id}`);
            fetchDishes(); // Refresh list of dishes
        } catch (error) {
            console.error('Error deleting the dish:', error);
        }
    };

    // Function that handle updating only attribute 'is_favorite' in table Dish
    const handleUpdateFavorite = async (dishName,isFavorite) => {
        try {
            await axios.post('http://localhost:5000/update-dish-favorite', {
                name: dishName,
                is_favorite: isFavorite,
            });
            fetchDishes(); // Refresh list of dishes with new information
        } catch (error) {
            console.error('Error updating attribute is_favorite:', error);
        }
    };

    // Function that handle updating the dish
    const handleUpdate = async () => {
        try {
            await axios.post('http://localhost:5000/update-dish', {
                ...editDish, // new data for dish
                originalName: editingDishName // old name of dish
            });
            fetchDishes(); // Refresh list of dish with new information
        } catch (error) {
            console.error('Error updating the product:', error);
        }
        // Clear variable for next updating
        setEditDish({
            name: '',
            difficulty_level: '',
            cooking_time: '',
            is_vegan: false,
            is_gluten_free: false,
            is_lactose_free: false,
        });
        setEditingDishName(null);
    };

    // Function that handle search and filter dishes
    const handleSearch = async () => {
        try {
            setErrorSearch('');
            let response;
            if (selectedFilter) {
                // If filters are selected, use /filter-dishes
                response = await axios.get(`http://localhost:5000/filter-dishes`, {
                    params: { filter: selectedFilter }
                });
            } else { // If filter not selected - user want to search for dish
                response = await axios.get(`http://localhost:5000/get-dish`, {
                    params: { name: searchQuery }
                });
            }
            // Show dishes, that were found
            setDishes(response.data); 
            setSelectedFilter(''); // clear filter
        } catch (err) {
            // Show error message to the user
            setErrorSearch('Error finding the dish or no dishes found');
            setDishes([]);
        }
    };

    // -----------------------------------------FORM------------------------------------
    // Function that handle searching product in the form
    const handleIngredientSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/get-product?name=${searchProduct}`);
            setFoundProducts(response.data); // Show found products to the user
        } catch (error) {
            console.error('Error searching for products:', error); 
        }
    };

    // Function that handle adding product to ingredient list of dish
    const handleAddIngredient = async (productId, productName, requiredAmount) => {
        try {
            const response = await axios.get(`http://localhost:5000/get-product?name=${productName}`);
            const product = response.data[0];
            if (product) { // If product exist in table Product
                // Fill variable 'ingredients' with new product information
                setIngredients([...ingredients, { 
                    productId, 
                    productName: product.name, 
                    unit: product.unit, 
                    requiredAmount 
                }]);
                setFoundProducts([]); // Clean found products
                setSearchProduct(''); // Clean searching product
            }
        } catch (error) {
            console.error('Error getting the product:', error); 
        }
    };

    // Function that handle adding new dish to the table Dish
    const handleSubmit = async (event) => {
        event.preventDefault(); // Overrides the form's default behavior
        try {
            await axios.post('http://localhost:5000/add-dish', {
                name: dishName,
                difficulty_level: difficultyLevel,
                cooking_time: cookingTime,
                is_vegan: isVegan,
                is_gluten_free: isGlutenFree,
                is_lactose_free: isLactoseFree,
                ingredients,
            });
            toggleForm(); // Close the form
            // Clear all variables for form
            setDishName('');
            setDifficultyLevel('');
            setCookingTime('');
            setIsVegan(false);
            setIsGlutenFree(false);
            setIsLactoseFree(false);
            setIngredients([]);
            fetchDishes(); // Refresh the list of dishes
        } catch (error) {
            console.error('Error adding the dish:', error);
        }
    };

    // Function that handle adding dish to calendar
    const handleAddMealPlan = async (dishId) => {
        const { date, mealType } = formDataCalendar;
    
        try {
          await axios.post('http://localhost:5000/plan-meal', {
            date,
            dish_id: dishId, 
            meal_type: mealType,
          });
          // Clear variable for the next adding
          setDishCalendar('null'); 
        } catch (error) {
          console.error('Error add to plan meal:', error);
        }
      };
    
    // Function that handle filling ''
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormDataCalendar((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    return (
        <div className="dish-container">
            <h2>Dishes</h2>
            {/*            SEARCH BAR         */}
            <div className="search-bar">
                <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">No Filter</option>
                    <option value="is_favorite">Favorite</option>
                    <option value="is_vegan">Vegan</option>
                    <option value="is_lactose_free">Lactose-Free</option>
                    <option value="is_gluten_free">Gluten-Free</option>
                </select>
                <input
                    type="text"
                    placeholder="Enter dish name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-button" onClick={handleSearch}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
                <button className="add-button" onClick={toggleForm}>+Add dish</button>
            </div>
            {errorSearch && <p style={{ color: 'red' }}>{errorSearch}</p>}


            {/*            LIST OF DISHES        */}
            <div className="dish-results">
                {dishes.map((dish) => (
                    <div key={dish.id} className="dish-card">
                        {editingDishName === dish.name ? (
                            <>
                            {/*          FORM FOR UPDATING            */}
                                <div className="button-group">
                                    <button className="confirm-button" onClick={handleUpdate}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="close-Button" onClick={() => {
                                            setEditingDishName(null);
                                            setErrorUpdate('');

                                        }}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                                <div className="nameUpd">
                                <input
                                    type="text"
                                    className="edit-field"
                                    name="name"
                                    value={editDish.name}
                                    onChange={(e) => handleEditValue('name', e.target.value)}
                                    placeholder="Enter dish name"
                                />
                                </div>
                                <p>
                                    Difficulty: 
                                    <select
                                        className="edit-field"
                                        name="difficulty_level"
                                        value={editDish.difficulty_level}
                                        onChange={(e) => handleEditValue('difficulty_level', e.target.value)}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </p>
                                <p>
                                    Cooking time: 
                                    <input
                                        type="text"
                                        className="edit-field"
                                        name="cooking_time"
                                        value={editDish.cooking_time}
                                        onChange={(e) => handleEditValue('cooking_time', e.target.value)}
                                        placeholder="e.g. 10 min, 1 hour etc."
                                    />
                                </p>
                                <div className="indicators">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_vegan"
                                            checked={editDish.is_vegan}
                                            onChange={(e) => handleEditValue('is_vegan', e.target.value)}
                                        />
                                        Vegan
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_gluten_free"
                                            checked={editDish.is_gluten_free}
                                            onChange={(e) => handleEditValue('is_gluten_free', e.target.value)}
                                        />
                                        Gluten-free
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_lactose_free"
                                            checked={editDish.is_lactose_free}
                                            onChange={(e) => handleEditValue('is_lactose_free', e.target.value)}
                                        />
                                        Lactose-free
                                    </label>
                                </div>
                            </>
                        ) : (
                        <>
                        {/*             DISH INFO            */}
                        {dish.is_favorite === 1 ? (
                            <button className="favorite-button" onClick={() => handleUpdateFavorite(dish.name, false)}>
                                <i className="fa-solid fa-heart"></i>
                            </button>
                        ) : (
                            <button className="favorite-button" onClick={() => handleUpdateFavorite(dish.name, true)}>
                                <i className="fa-regular fa-heart"></i>
                            </button>
                        )}
                        <div className="button-group">
                            <button className="update-button" onClick={() => {
                                    setEditingDishName(dish.name);
                                }}>
                                <i className="fa-solid fa-pen"></i>
                            </button>
                            <button className="delete-button" onClick={() => handleDelete(dish.id)}>
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                        <h3>{dish.name}</h3>
                        <p>Difficulty: {dish.difficulty_level}</p>
                        <p>Cooking time: {dish.cooking_time}</p>
                        <div className="indicators">
                            {(dish.is_lactose_free==1) && <span>Lactose-free</span>}
                            {(dish.is_gluten_free==1) && <span>Gluten-free</span>}
                            {(dish.is_vegan==1) && <span>Vegan</span>}
                        </div>
                        <p>Ingredients:</p>
                        <ul>
                            {dish.ingredients.map((ingredient, i) => (
                                <li key={i}>{ingredient.product_name} ({ingredient.required_amount} {ingredient.unit})</li>
                            ))}
                        </ul>
                        </>
                      )}
                      {dishCalendar === dish.name ? (
                        <div className="add-form">
                        <label>
                            Date:
                            <input
                            type="date"
                            name="date"
                            value={formDataCalendar.date}
                            onChange={handleInputChange}
                            required
                            />
                        </label>
                        <label>
                            Meal Type:
                            <select
                            name="mealType"
                            value={formDataCalendar.mealType}
                            onChange={handleInputChange}
                            >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            </select>
                        </label>
                        <button onClick={() => handleAddMealPlan(dish.id)}>Add to Calendar</button>
                        </div>
                    ) : (
                        <button
                        className="add-calendar-button"
                        onClick={() => setDishCalendar(dish.name)} // Встановлюємо активну страву
                        >
                        +Add to Plan Meal
                        </button>
                    )}
                    </div>
                ))}
            </div>

            {/*             HIDDEN FORM FOR ADD DISH            */}
            {isFormOpen && (
             <div className="modal">
                <div className="modal-overlay" onClick={toggleForm}></div>
                <div className="modal-content">
                    <div className="form-container">
                        <h2>Create dish</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Dish name *" 
                                value={dishName} 
                                onChange={(e) => setDishName(e.target.value)} 
                                required 
                            />
                            <select 
                                value={difficultyLevel} 
                                onChange={(e) => setDifficultyLevel(e.target.value)} 
                                required
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <input 
                                type="text" 
                                placeholder="Cooking time *" 
                                value={cookingTime} 
                                onChange={(e) => setCookingTime(e.target.value)} 
                                required 
                            />
                            <div>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={isVegan} 
                                        onChange={(e) => setIsVegan(e.target.checked)} 
                                    />
                                    Vegan
                                </label>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={isGlutenFree} 
                                        onChange={(e) => setIsGlutenFree(e.target.checked)} 
                                    />
                                    Gluten free
                                </label>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={isLactoseFree} 
                                        onChange={(e) => setIsLactoseFree(e.target.checked)} 
                                    />
                                    Lactose free
                                </label>
                            </div>
                            
                            <div>
                                <h3>Ingredients</h3>
                                <input 
                                    type="text" 
                                    placeholder="Search product" 
                                    value={searchProduct} 
                                    onChange={(e) => setSearchProduct(e.target.value)} 
                                />
                                <button type="button" onClick={handleIngredientSearch}>Search</button>
                            </div>

                            {/*    SHOW FOUND PRODUCTS  */}
                            {foundProducts.map(product => (
                                <div key={product.id}>
                                    <span>{product.name}</span>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        placeholder="Amount" 
                                        onChange={(e) => setFoundProducts(
                                            foundProducts.map(p => 
                                                p.id === product.id ? { ...p, amount: e.target.value } : p
                                            )
                                        )} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => handleAddIngredient(product.id,product.name, product.amount)} 
                                        disabled={!product.amount || product.amount <= 0}
                                    >
                                        Add Ingredient
                                    </button>
                                </div>
                            ))}

                            {/*   SHOW ADDED PRODUCT   */}
                            <ul>
                                {ingredients.map((ingredient, index) => (
                                    <li key={index}>
                                        {ingredient.productName}: {ingredient.requiredAmount} {ingredient.unit}
                                    </li>
                                ))}
                            </ul>

                            <button className="add-dish-button" type="submit">Add dish</button>
                        </form>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default Dish;
