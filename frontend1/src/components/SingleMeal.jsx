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
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/get-dish', {
          params: { name: searchQuery }
        });
        if (response.data.length === 0) {
          setNoResultsMessage('No dishes found');
          setSearchResults([]);
        } else {
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

      const response = await axios.post('http://localhost:5000/plan-meal', {
        //calendar_id: selectedDate,
        date: format(selectedDate, 'yyyy-MM-dd'), // Конвертуємо дату перед відправкою
  
        dish_id: dishId,
        meal_type,
      });

      //console.log('Response from server:', response); // Логування відповіді сервера

      if (response.status === 201) {

        setSelectedDish(searchResults.find((dish) => dish.id === dishId));
        setSearchQuery('');
        setSearchResults([]);
        fetchPlannedDishes();
      }
    } catch (error) {

      console.error('Error planning meal', error);
      setError('Failed to plan meal');
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

  

  return (
    <div className="single-meal">
      <h3>{meal_type.charAt(0).toUpperCase() + meal_type.slice(1)}</h3>

      {plannedDishes && plannedDishes.length > 0 ? (
        <ul>
          {plannedDishes.map((dish) => (
            <li key={dish.id}>{dish.name}
            <button onClick={() => handleDeleteDish(dish.id)}>Delete</button>
            </li>
            
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
            <ul>
              {searchResults.map((dish) => (
                <li key={dish.id}>
                  {dish.name}
                  <button onClick={() => handleAddDish(dish.id)}>Add</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};
    
export default SingleMeal;
