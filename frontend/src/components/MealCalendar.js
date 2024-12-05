import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const MealCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="calendar-data">
    <div className="dates-part">
      <h2>Calendar</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
      />
      <p>Selected Date: {selectedDate.toDateString()}</p>
    </div>

    <div className="meals-part">
      <h2>Meals</h2>
      <div className="meal">
        <h3>Breakfast</h3>
        
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
