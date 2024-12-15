import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
//import Calendar from 'react-calendar';
//import './SingleMeal.css';

const SingleMeal = ({selectedDate, meal_type}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [error, setError] = useState(''); // Стан для помилки
  const [searchResults, setSearchResults] = useState(null);
  const [plannedDishes, setPlannedDishes] = useState([]);
  const [insufficientProducts, setInsufficientProducts] = useState([]);


  const [noResultsMessage, setNoResultsMessage] = useState('');

  // Fetch planned dishes for the given meal type and date
  const fetchPlannedDishes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/meals-for-day', {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          meal_type,
        },
      });
      setPlannedDishes(response.data);
    } catch (error) {
      console.error(`Error fetching ${meal_type} meals:`, error);
      setError('Failed to load planned dishes.');
    }
  };
  useEffect(() => {
    

    fetchPlannedDishes();
  }, [selectedDate, meal_type]);



  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleSearch = async (event) => {

    if (event.key === 'Enter') {
      //if product name empty, show all products
      if (searchQuery.trim() === '') {
        setSearchResults(null);
        setNoResultsMessage('');
        setError('');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/get-dish', {
          params: { name: searchQuery }
        });
        if (response.data.length === 0) {
          setError('');
          setNoResultsMessage('No dishes found');
          setSearchResults([]);
        } else {
          setError('');
          setNoResultsMessage('');
          setSearchResults(response.data); //save search results
        }
      } catch (error) {
        setNoResultsMessage('No dishes found');

        //alert('Error searching item: ' + error.response?.data || error.message);
        setSearchResults([]);
      }
    }
  };

  const handleAddDish = async (dishId) => {
    try {
      
      // console.log('handleAddDish called with dish:', dish);  // Це дозволить перевірити, чи викликається функція


      const response = await axios.post('http://localhost:5000/plan-meal', {
        //calendar_id: selectedDate,
        date: format(selectedDate, 'yyyy-MM-dd'), // Конвертуємо дату перед відправкою
  
        dish_id: dishId,
        meal_type,
      });

      // console.log('Response from server:', response); // Логування відповіді сервера

      if (response.status === 201) {

        setSelectedDish(dishId);
        setSearchQuery('');
        setSearchResults([]);
        fetchPlannedDishes();
        missingProducts('');
        setInsufficientProducts([]);
        setError('');
      }else if (response.status === 200 && response.data.insufficientProducts) {
        setSelectedDish(dishId);
        setInsufficientProducts(response.data.insufficientProducts);
        // Якщо продуктів недостатньо, відобразити пропозицію додати їх
        const missingProducts = response.data.insufficientProducts
          .map((product) => `${product.name} (required: ${product.required_amount}, available: ${product.amount - product.reserved_amount})`)
          .join('\n');
  
        setError(`Insufficient products to prepare this dish:\n${missingProducts}\n\n${response.data.suggestion}`);
        
      } else if (response.status === 200 && response.data.message) {
        // Якщо сервер повернув повідомлення про успіх
        console.log(response.data.message); // Виводимо в консоль
        setError(response.data.message);  // Можна відобразити повідомлення в інтерфейсі
        alert('OK');
      }
    } catch (error) {

      console.error('Error planning meal', error);
      setError('Failed to plan meal');
    }
  };

  const handleAddToShoppingList = async () => {
    try {
      // setSelectedDish(dish);
      // setSearchQuery('');
      // setSearchResults([]);
      const response = await axios.post('http://localhost:5000/add-multiple-to-shopping-list', {
        insufficientProducts: insufficientProducts,
        dish_id: selectedDish,
        date: format(selectedDate, 'yyyy-MM-dd'), // Конвертуємо дату перед відправкою
  
        meal_type,
      });
  
      if (response.status === 201) {
      
      // 4. Очищення станів після успішного додавання
      // setSelectedDish(null);
      setSearchQuery('');
      setSearchResults([]);
      setInsufficientProducts([]);

      alert('Dish successfully planned and products added to the shopping list');

      }
    } catch (error) {
      // console.error('Error adding products to shopping list:', error);
      // setError('Error adding products to shopping list.');
      // alert('Failed to add products to the shopping list');
      if (error.response) {
        // Помилка з відповіді сервера
        setError('Server error: ' + error.response.data);
      } else if (error.request) {
        // Помилка в запиті
        setError('No response from server');
      } else {
        // Інші помилки
        setError('An error occurred: ' + error.message);
      }

    }
  };
  

  // Видалення страви
  const handleDeleteDish = async (dishId) => {
    try {
      await axios.delete(`http://localhost:5000/delete-planned-dish/${dishId}`, {
        data: { date: format(selectedDate, 'yyyy-MM-dd'), meal_type },
      });
      // Оновлення списку після видалення
      fetchPlannedDishes();

    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  const handleCancel = () => {
    // setSelectedDish(null);
    setSearchQuery('');
    setSearchResults([]);
    setInsufficientProducts([]);
    setError('');
  };
  

  return (
    <div className="single-meal">
      <h3>{meal_type.charAt(0).toUpperCase() + meal_type.slice(1)}</h3>

      {plannedDishes && plannedDishes.length > 0 ? (
        <ul>
          {plannedDishes.map((dish) => (
            <div className="planned-dish">
              <p>{dish.name}</p>
              {/* <p>Cooking time: {dish.cooking_time}</p> */}

              {/* <button onClick={() => handleDeleteDish(dish.id)}>Delete</button> */}
              <i className="fas fa-trash delete-icon" onClick={() => handleDeleteDish(dish.id)}></i>

              
            </div>
          ))}

        </ul>
      ) : (

        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleSearch}
            className="meal-search"
            placeholder={`Search for ${meal_type} dishes`}
          />
          {noResultsMessage && <p>{noResultsMessage}</p>}
          {searchResults && searchResults.length > 0 && (
          <>
          {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul>
              {searchResults.map((dish) => (
                <div className="planned-dish" key={dish.id}>
                  <li>
                    {dish.name}
                  </li>
                  <i 
                    className="fas fa-plus add-icon" 
                    onClick={() => handleAddDish(dish.id)} // передаємо весь dish, а не тільки id
                  ></i>
                </div>
              ))}
            </ul>
            </>
          )}
        </div>
      )}

<div>
    {error && <div className="error-message">{error}</div>}
    {/* Ваш інший код */}
  </div>
    {insufficientProducts.length > 0 && (
      <>
      <button onClick={handleAddToShoppingList}>Add Missing Products to Shopping List</button>
      <button onClick={handleCancel}>Cancel</button>
      </>
    )}

    </div>
  );
};
    
export default SingleMeal;
