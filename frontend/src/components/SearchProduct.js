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
  const handleSearch = async (event) => {
    if (productName.trim() === '') {
      setSearchResults(null);
      return;
    }
    if (event.key === 'Enter') {
      try {
        const response = await axios.get('http://localhost:5000/get-product', {
          params: { name: productName }
        });
        //alert(response.data); // Показуємо повідомлення про успішне додавання
        //setProductName(''); // Очищаємо поле введення
        setSearchResults(response.data); // Зберігаємо результати пошуку
      } catch (error) {
        alert('Error searching item: ' + error.response?.data || error.message);
        setSearchResults(null);
      }

    }

  };
  return (
    <div>
      <div className="search-box">
        <input
          type="text"
          value={productName}
          onChange={handleInputChange}
          onKeyPress={handleSearch} // Call handleSearch on key press
          placeholder="Enter product name"
        />
      </div>
      {/*<button onClick={handleSearch}>Search</button>*/}
      {/* Відображення результатів пошуку */}
      {searchResults && (
        <div className="product-list">
          {searchResults.map((product) => (
            <div key={product.id} className="product-item">
              <p><strong>Name:</strong> {product.name} className="product-item"</p>
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
