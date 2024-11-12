import React, { useState } from 'react';
import axios from 'axios';
import './SearchDish.css'; 

const SearchDish = ({fetchDishes}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [dishes, setDishes] = useState([]);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        fetchDishes(true); // clear all product
        try {
            setError('');
            const response = await axios.get(`/get-dish`, {
                params: { name: searchQuery }
            });
            setDishes(response.data); 
        } catch (err) {
            setError('Error finding the dish or no dishes found');
            setDishes([]);
        }
    };

    return (
        <div className="search-dish-container">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Enter dish name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>🔍</button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="dish-results">
                {dishes.map((dish, index) => (
                    <div key={index} className="dish-card">
                        <h3>{dish.name}</h3>
                        <p>Difficulty: {dish.difficulty_level}</p>
                        <p>Cooking time: {dish.cooking_time}</p>
                        {dish.is_lactose_free && <p>Lactose-free</p>}
                        {dish.is_gluten_free && <p>Gluten-free</p>}
                        {dish.is_vegan && <p>Vegan</p>}
                        <p>Ingredients:</p>
                        <ul>
                            {dish.ingredients.map((ingredient, i) => (
                                <li key={i}>{ingredient.product_name} ({ingredient.required_amount} {ingredient.unit})</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchDish;
