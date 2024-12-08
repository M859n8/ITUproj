import React, {useState} from 'react';
import { useProducts } from './ProductContext.jsx';
import axios from "axios";

const ProductList = () => {
  //get products data
  const { products } = useProducts();

  const { fetchProducts } = useProducts();
  //save search name
  const [productName, setProductName] = useState('');
  //save search results from backend, if there was no search -> null
  const [searchResults, setSearchResults] = useState(null);
  const [noResultsMessage, setNoResultsMessage] = useState('');

  //update productName when user add text to search
  const handleInputChange = (event) => {
    setProductName(event.target.value);
  };
  //when user press "Enter"
  const handleSearch = async (event) => {

    if (event.key === 'Enter') {
      //if product name empty, show all products
      if (productName.trim() === '') {
        setSearchResults(null);
        setNoResultsMessage('');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/get-product', {
          params: { name: productName }
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

        setSearchResults([]);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // Передача параметра через URL (тіло не потрібне)
      await axios.delete(`http://localhost:5000/delete-product/${productId}`);
      
      // Оновлення списку після видалення (якщо потрібно)
      await fetchProducts();
      // setProductName('');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div>
      <div className="search-box">
        <input
          type="text"
          value={productName}
          onChange={handleInputChange}
          onKeyDown={handleSearch} // Call handleSearch on key press
          placeholder="Enter product name"
        />
      </div>
      {noResultsMessage && <p>{noResultsMessage}</p>}
      {/*if search results not empty show them, otherwise show all products*/}
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
            <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ProductList;