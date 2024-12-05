import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import Calendar from 'react-calendar';
import './MealCalendar.css';

const MealCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  // const [calendarId, setCalendarId] = useState(1); // Приклад calendar_id
  // const [mealType, setMealType] = useState('lunch'); // Приклад meal_type
  const [error, setError] = useState(''); // Стан для помилки
  //const [dishName, setDishName] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [plannedDishes, setPlannedDishes] = useState([]);

  const [noResultsMessage, setNoResultsMessage] = useState('');

  useEffect(() => {
    const fetchPlannedDishes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/meals-for-day', {
          params: { date: format(selectedDate, 'yyyy-MM-dd'), mealType: 'breakfast' },
        });
        console.log('Received data:', response.data);
        setPlannedDishes(response.data);
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    };
  
   fetchPlannedDishes();
  }, [selectedDate]); // Оновлення даних при зміні selectedDate або mealType
  



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

  const handleAddDish = async (dishId, mealType) => {
    try {

      const response = await axios.post('http://localhost:5000/plan-meal', {
        //calendar_id: selectedDate,
        date: format(selectedDate, 'yyyy-MM-dd'), // Конвертуємо дату перед відправкою
  
        dish_id: dishId,
        meal_type: mealType,
      });

      console.log('Response from server:', response); // Логування відповіді сервера

      if (response.status === 201) {

        setSelectedDish(searchResults.find((dish) => dish.id === dishId));
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {

      console.error('Error planning meal', error);
      setError('Failed to plan meal');
    }
  };

  

  return (
    <div className="calendar-data">
    <div className="dates-part">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        className="custom-calendar"
      />
      <p>Selected Date: {selectedDate.toDateString()}</p>
    </div>

    <div className="meals-part">
      <div className="meal">
        <h3>Breakfast</h3>
        <div>
        <div className="search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleSearch} // Call handleSearch on key press
            placeholder="Enter product name"
          />
        </div>

      {/* {error && <p style={{ color: 'red' }}>{error}</p>} //Виведення помилки */}
      {noResultsMessage && <p>{noResultsMessage}</p>}

      {plannedDishes && plannedDishes.length > 0 ? (
        
        <ul>
          {plannedDishes.map((dish) => (
            <li key={dish.id}>
              {dish.name}
            </li>
          ))}
        </ul>
      ) : searchResults && searchResults.length > 0 ?  (
        <ul>
          {searchResults.map((dish) => (
            <li key={dish.id}>
              {dish.name}
              <button onClick={() => handleAddDish(dish.id, 'breakfast')}>Add to Plan</button>
            </li>
          ))}
        </ul>
      
      ) : (
        <div>
        </div>

      )}

     
    {/* <button onClick={() => fetchPlannedDishes(selectedDate)}>fffff</button> */}
      

      {/* {selectedDish && (
        <div>
          <h3>Selected Dish:</h3>
          <p>{selectedDish.name}</p>
        </div>
      )} */}
    </div>
      </div>
      <div className="meal">
        <h3>Lunch</h3>
      </div>
      <div className="meal">
        <h3>Dinner</h3>
      </div>
    </div>
    </div>

  );
};

export default MealCalendar;
