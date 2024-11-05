import React, {useState} from 'react';
import { useProducts } from './ProductContext';
import axios from "axios";

const ProductList = () => {
  const { products } = useProducts();
  //const { fetchProducts } = useProducts();
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
      //fetchProducts();
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
      {searchResults && searchResults.length > 0 ? (
        <div className="product-list">
          {searchResults.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <div className="product-details">
                <p>Amount: {product.amount} {product.unit}</p>
                <p>Price: {product.price}$</p>
                <p>Lactose Free: {product.lactose_free ? 'Yes' : 'No'}</p>
                <p>Gluten Free: {product.gluten_free ? 'Yes' : 'No'}</p>
                <p>Vegan: {product.vegan ? 'Yes' : 'No'}</p>
                {product.expiration_date && (
                  <p>Expiration Date: {product.expiration_date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <div className="product-details">
                <p>Amount: {product.amount} {product.unit}</p>
                <p>Price: {product.price}$</p>
                <p>Lactose Free: {product.lactose_free ? 'Yes' : 'No'}</p>
                <p>Gluten Free: {product.gluten_free ? 'Yes' : 'No'}</p>
                <p>Vegan: {product.vegan ? 'Yes' : 'No'}</p>
                {product.expiration_date && (
                  <p>Expiration Date: {product.expiration_date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ProductList;