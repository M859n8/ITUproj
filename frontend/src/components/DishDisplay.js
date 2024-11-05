import React, { useEffect, useState } from 'react';
import DishItem from './DishItem'; // Ваш компонент для відображення окремої страви

const DishDisplay = () => {
    const [dishes, setDishes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Функція для отримання всіх страв
        const fetchDishes = async () => {
            try {
                const response = await fetch('/dishes');
                const data = await response.json();
                setDishes(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching dishes:', error);
                setIsLoading(false);
            }
        };

        fetchDishes(); // Виклик функції при завантаженні компонента
    }, []);

    // Функція для обробки пошуку
    const handleSearch = async () => {
        const response = await fetch(`/search-dish?name=${searchQuery}`);
        const data = await response.json();
        setSearchResults(data);
        setDishes([]); // Очищення списку страв для відображення результатів пошуку
    };

    // Функція для додавання нової страви
    const handleAddDish = (newDish) => {
        setDishes((prevDishes) => [...prevDishes, newDish]);
    };

    return (
        <section id="dishes">
            <h2>Dishes</h2>
            <div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a dish"
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {(searchResults.length > 0 ? searchResults : dishes).map((dish) => (
                        <DishItem key={dish.id} dish={dish} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default DishDisplay;
