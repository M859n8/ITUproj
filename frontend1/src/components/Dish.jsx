import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dish.css'; 

const Dish = () => {
    // SEARCH
    const [searchQuery, setSearchQuery] = useState('');
    const [dishes, setDishes] = useState([]);
    // ERRORS
    const [errorSearch, setErrorSearch] = useState('');
    const [errorUpdate, setErrorUpdate] = useState('');
    // SHOW
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
    // EDIT
    const [editingProductName, setEditingProductName] = useState(null);
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
    
    // const handleFilterChange = (event) => {
    //     const { value, checked } = event.target;
    //     setSelectedFilters((prev) =>
    //         checked ? [...prev, value] : prev.filter((filter) => filter !== value)
    //     );
    // };

    const handleEditValue = (field, value) => {
        setEditDish(prev => ({ ...prev, [field]: value }));
    };
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
            // fetchDishes(); Може замінити на це?
        } catch (error) {
            console.error('Error deleting the dish:', error);
        }
    };

    const handleUpdateFavorite = async (dishName,isFavorite) => {
        // console.log('You here');
        try {
            await axios.post('http://localhost:5000/update-dish-favorite', {
                name: dishName,
                is_favorite: isFavorite, // true або false
            });
            // console.error('You here!');
            fetchDishes();
        } catch (error) {
            console.error('Error deleting the dish:', error);
        }
        // setIsFavorite(false);

    };

    const handleUpdate = async () => {
        if (!editDish.name) {
            setErrorUpdate('This field is required.');
            return;
        }
        try {
            await axios.post('http://localhost:5000/update-dish', {
                ...editDish, // Нові дані страви
                originalName: editingProductName // Передаємо старе ім'я
            });
            fetchDishes();
        } catch (error) {
            console.error('Error updating the product:', error);
        }
        setEditDish({
            name: '',
            difficulty_level: '',
            cooking_time: '',
            is_vegan: false,
            is_gluten_free: false,
            is_lactose_free: false,
        });
        setEditingProductName(null);
    };

    const handleSearch = async () => {
        // fetchDishes(true); // clear all product
        try {
            setErrorSearch('');
            let response;
            if (selectedFilter) {
                // Якщо обрані фільтри, використовуємо `/filter-dishes`
                response = await axios.get(`http://localhost:5000/filter-dishes`, {
                    params: { filter: selectedFilter }
                });
            } else {
                // Інакше виконуємо пошук за назвою через `/get-dish`
                response = await axios.get(`http://localhost:5000/get-dish`, {
                    params: { name: searchQuery }
                });
            }
            setDishes(response.data); 
            setSelectedFilter('');
        } catch (err) {
            setErrorSearch('Error finding the dish or no dishes found');
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
            {/* <div className="filter-container"> */}
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
            {/* </div> */}
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


            <div className="dish-results">
                {dishes.map((dish) => (
                    <div key={dish.id} className="dish-card">
                        {editingProductName === dish.name ? (
                            <>
                                <div className="button-group">
                                    <button className="confirm-button" onClick={handleUpdate}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="close-Button" onClick={() => {
                                            setEditingProductName(null);
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
                                {errorUpdate && <p style={{ color: 'red' }}>{errorUpdate}</p>}
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
                                        placeholder="Enter cooking time(e.g. 10 min, 1 hour etc.)"
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
                                    setEditingProductName(dish.name);
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
