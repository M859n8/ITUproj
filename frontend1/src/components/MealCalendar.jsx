import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import Calendar from 'react-calendar';
import './MealCalendar.css';
import SingleMeal from './SingleMeal';


const MealCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
   
  
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
        <SingleMeal
        selectedDate = {selectedDate}
        meal_type = "breakfast"
        />
       
      </div>
      <div className="meal">
        <SingleMeal
          selectedDate = {selectedDate}
          meal_type = "lunch"
          />
      </div>
      <div className="meal">
        <SingleMeal
          selectedDate = {selectedDate}
          meal_type = "dinner"
          />
      </div>
    </div>
    </div>

  );
};

export default MealCalendar;
