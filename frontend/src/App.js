//import logo from './logo.svg';
//import './App.css';
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // Стан для зберігання назви нового елемента
  const [itemName, setItemName] = useState('');

  // Обробник зміни значення в полі введення
  const handleInputChange = (event) => {
    setItemName(event.target.value);
  };

  // Обробник кнопки "Додати елемент"
  const handleAddItem = async () => {
    if (itemName.trim() === '') {
      alert('Please enter a name for the item');
      return;
    }

    try {
      // Надсилання POST-запиту на бекенд
      const response = await axios.post('http://localhost:5000/add-item', { name: itemName });
      alert(response.data); // Показуємо повідомлення про успішне додавання
      setItemName(''); // Очищаємо поле введення
    } catch (error) {
      alert('Error adding item: ' + error.response?.data || error.message);
    }
  };

  return (
      <div>
        <h2>Add a New Item</h2>
        <input
            type="text"
            value={itemName}
            onChange={handleInputChange}
            placeholder="Enter item name"
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>
  );
}

export default App;

