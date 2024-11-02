//import logo from './logo.svg';
//import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import AddProduct from './components/AddProduct';


function App() {
  // Стан для зберігання назви нового елемента
  const [productName, setProductName] = useState('');

  // Обробник зміни значення в полі введення
  const handleInputChange = (event) => {
    setProductName(event.target.value);
  };

  // Обробник кнопки "Додати елемент"
  const handleSearch = async () => {
    if (productName.trim() === '') {
      alert('Please enter a name for the item');
      return;
    }

    try {
      // Надсилання POST-запиту на бекенд
      const response = await axios.get('http://localhost:5000/get-product', {data: { name: productName } });
      alert(response.data); // Показуємо повідомлення про успішне додавання
      setProductName(''); // Очищаємо поле введення
    } catch (error) {
      alert('Error searching item: ' + error.response?.data || error.message);
    }
  };

  return (
      <div>
        <h2>Search product</h2>
        <input
            type="text"
            value={productName}
            onChange={handleInputChange}
            placeholder="Enter product name"
        />
        <button onClick={handleSearch}>Search</button>
        <AddProduct />
      </div>
  );
}

export default App;

