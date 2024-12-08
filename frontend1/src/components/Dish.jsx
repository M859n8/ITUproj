import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dish.css'; 

const Dish = () => {
    // SEARCH
    const [searchQuery, setSearchQuery] = useState('');
    const [dishes, setDishes] = useState([]);
    const [error, setError] = useState('');
    // SHOW
    // const [dishes, setDishes] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    // FORM
    const [dishName, setDishName] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('easy');
    const [cookingTime, setCookingTime] = useState('');
    const [isVegan, setIsVegan] = useState(false);
    const [isGlutenFree, setIsGlutenFree] = useState(false);
    const [isLactoseFree, setIsLactoseFree] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [foundProducts, setFoundProducts] = useState([]);

    const toggleForm = () => {
        setIsFormOpen(!isFormOpen);
    };

    // Function for showing all dishes
    const fetchDishes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-all-dishes');
            if (Array.isArray(response.data)) {
                setDishes(response.data);
            } else {
                console.error('Expected an array, but received:', response.data);
                setDishes([]); // Set empty array in case of unexpected response
            }
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

    useEffect(() => {
        fetchDishes(); // Retrieve dishes when the component loads
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/delete-dish/${id}`);
            // Show all dishes except for the deleted one
            setDishes(dishes.filter(dish => dish.id !== id));
        } catch (error) {
            console.error('Error deleting the dish:', error);
        }
    };

    const handleSearch = async () => {
        // fetchDishes(true); // clear all product
        try {
            setError('');
            const response = await axios.get(`http://localhost:5000/get-dish`, {
                params: { name: searchQuery }
            });
            setDishes(response.data); 
        } catch (err) {
            setError('Error finding the dish or no dishes found');
            setDishes([]);
        }
    };
    // FORM
    const handleIngredientSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/get-product?name=${searchProduct}`);
            setFoundProducts(response.data);
        } catch (error) {
            console.error('Error searching for products:', error); 
        }
    };

    const handleAddIngredient = async (productId, productName, requiredAmount) => {
        try {
            const response = await axios.get(`http://localhost:5000/get-product?name=${productName}`);
            const product = response.data[0];
            if (product) {
                setIngredients([...ingredients, { 
                    productId, 
                    productName: product.name, 
                    unit: product.unit, 
                    requiredAmount 
                }]);
                setFoundProducts([]); // Clean found products
                setSearchProduct(''); // Clear searching field
            }
        } catch (error) {
            console.error('Error searching for products:', error); 
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/add-dish', {
                name: dishName,
                difficulty_level: difficultyLevel,
                cooking_time: cookingTime,
                is_vegan: isVegan,
                is_gluten_free: isGlutenFree,
                is_lactose_free: isLactoseFree,
                ingredients,
            });
            toggleForm(); // Close the form
            setDishName('');
            setDifficultyLevel('');
            setCookingTime('');
            setIsVegan(false);
            setIsGlutenFree(false);
            setIsLactoseFree(false);
            setIngredients([]);
            fetchDishes(); // Refresh the list of dishes
        } catch (error) {
            console.error('Error creating dish:', error);
        }
    };
    return (
        <div className="dish-container">
            <h2>Dishes</h2>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Enter dish name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-button" onClick={handleSearch}>🔍</button>
                <button className="add-button" onClick={toggleForm}>+Add dish</button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}


            <div className="dish-results">
                {dishes.map((dish) => (
                    <div key={dish.id} className="dish-card">
                        <button className="delete-button" onClick={() => handleDelete(dish.id)}>🗑️</button>
                        <h3>{dish.name}</h3>
                        <p>Difficulty: {dish.difficulty_level}</p>
                        <p>Cooking time: {dish.cooking_time}</p>
                        <div className="indicators">
                            {dish.is_lactose_free && <span>Lactose-free</span>}
                            {dish.is_gluten_free && <span>Gluten-free</span>}
                            {dish.is_vegan && <span>Vegan</span>}
                        </div>
                        <p>Ingredients:</p>
                        <ul>
                            {dish.ingredients.map((ingredient, i) => (
                                <li key={i}>{ingredient.product_name} ({ingredient.required_amount} {ingredient.unit})</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {isFormOpen && (
             <div className="modal">
                <div className="modal-overlay" onClick={toggleForm}></div>
                <div className="modal-content">
                    <div className="form-container">
                        <h2>Create dish</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Dish name" 
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
                                placeholder="Cooking time" 
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

                            {/* Show added products*/}
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
