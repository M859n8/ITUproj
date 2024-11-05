import React, { useState } from 'react';
import axios from 'axios';
import './AddDish.css';

const AddDish = ({ onClose, fetchDishes  }) => {
    const [dishName, setDishName] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('easy');
    const [cookingTime, setCookingTime] = useState('');
    const [isVegan, setIsVegan] = useState(false);
    const [isGlutenFree, setIsGlutenFree] = useState(false);
    const [isLactoseFree, setIsLactoseFree] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [foundProducts, setFoundProducts] = useState([]);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`/get-product?name=${searchProduct}`);
            setFoundProducts(response.data);
        } catch (error) {
            console.error('Error searching for products:', error); // delete
        }
    };

    // const handleAddIngredient = (productId, requiredAmount) => {
    //     setIngredients([...ingredients, { productId, requiredAmount }]);
    //     setFoundProducts([]); // Очищаємо список знайдених продуктів
    //     setSearchProduct(''); // Очищаємо поле пошуку
    // };
    const handleAddIngredient = (productId, requiredAmount) => {
        // Знаходимо продукт за його ID, щоб отримати назву та одиницю виміру
        const product = foundProducts.find(prod => prod.id === productId);
    
        if (product) {
            setIngredients([...ingredients, { 
                productId, 
                productName: product.name, // Додаємо назву продукту
                unit: product.unit, // Додаємо одиницю виміру
                requiredAmount 
            }]);
            setFoundProducts([]); // Очищаємо список знайдених продуктів
            setSearchProduct(''); // Очищаємо поле пошуку
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/add-dish', {
                name: dishName,
                difficulty_level: difficultyLevel,
                cooking_time: cookingTime,
                is_vegan: isVegan,
                is_gluten_free: isGlutenFree,
                is_lactose_free: isLactoseFree,
                ingredients,
            });
            console.log('Dish created:', response.data); // delete
            onClose(); // Закриваємо форму

            fetchDishes(); // Вимагайте, щоб батьківський компонент отримував новий список
        } catch (error) {
            console.error('Error creating dish:', error);
        }
    };

    return (
        <div className="modal-overlay">
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
                    
                    {/* <input 
                        type="text" 
                        placeholder="Search product" 
                        value={searchProduct} 
                        onChange={(e) => setSearchProduct(e.target.value)} 
                    />
                    <button type="button" onClick={handleSearch}>Search</button>

                    {foundProducts.map(product => (
                        <div key={product.id}>
                            <span>{product.name}</span>
                            <input 
                                type="number" 
                                min="1" 
                                placeholder="Amount" 
                                onChange={(e) => handleAddIngredient(product.id, e.target.value)} 
                            />
                        </div>
                    ))} */}
                    {/* Поле для пошуку продуктів */}
                    <div>
                        <h3>Ingredients</h3>
                        <input 
                            type="text" 
                            placeholder="Search product" 
                            value={searchProduct} 
                            onChange={(e) => setSearchProduct(e.target.value)} 
                        />
                        <button type="button" onClick={handleSearch}>Search</button>
                    </div>

                    {/* Відображення знайдених продуктів */}
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
                                onClick={() => handleAddIngredient(product.id, product.amount)} 
                                disabled={!product.amount || product.amount <= 0}
                            >
                                Add Ingredient
                            </button>
                        </div>
                    ))}

                    {/* Відображення доданих інгредієнтів */}
                    <ul>
                        {ingredients.map((ingredient, index) => (
                            <li key={index}>
                                {ingredient.productName}: {ingredient.requiredAmount} {ingredient.unit}
                            </li>
                        ))}
                    </ul>

                    <button type="submit">Add dish</button>
                </form>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default AddDish;
