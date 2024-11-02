import React, { useState } from 'react';
import axios from 'axios';
function SearchProduct() {
  // Стан для зберігання назви нового елемента
  const [productName, setProductName] = useState('');
  const [searchResults, setSearchResults] = useState(null); // Стан для результатів пошуку

  // Обробник зміни значення в полі введення
  const handleInputChange = (event) => {
    setProductName(event.target.value);
  };
  // Обробник кнопки "Шукати елемент"
  const handleSearch = async () => {
    if (productName.trim() === '') {
      alert('Please enter a name for the item');
      return;
    }

    try {
      // Надсилання POST-запиту на бекенд
      const response = await axios.get('http://localhost:5000/get-product', {
        params: { name: productName }
      });
      //alert(response.data); // Показуємо повідомлення про успішне додавання
      setProductName(''); // Очищаємо поле введення
      setSearchResults(response.data); // Зберігаємо результати пошуку
    } catch (error) {
      alert('Error searching item: ' + error.response?.data || error.message);
      setSearchResults(null);
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
      {/* Відображення результатів пошуку */}
      {searchResults && (
        <div style={{ marginTop: '20px' }}>
          <h3>Search Results:</h3>
          {searchResults.map((product) => (
            <div key={product.id}>
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Amount:</strong> {product.amount} {product.unit}</p>
              <p><strong>Price:</strong> {product.price}</p>
              <p><strong>Lactose Free:</strong> {product.lactose_free ? 'Yes' : 'No'}</p>
              <p><strong>Gluten Free:</strong> {product.gluten_free ? 'Yes' : 'No'}</p>
              <p><strong>Vegan:</strong> {product.vegan ? 'Yes' : 'No'}</p>
              {product.expiration_date && (
                <p><strong>Expiration Date:</strong> {product.expiration_date}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchProduct;
