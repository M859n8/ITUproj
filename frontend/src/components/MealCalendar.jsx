/*  Author : Maryna Kucher 
    Login : xkuche01      */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import './MealCalendar.css';
import SingleMeal from './SingleMeal';

// template foe calendar and meals 
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
