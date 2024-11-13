import React, {useState} from 'react';
import { useProducts } from './ProductContext';
import axios from "axios";

const ProductList = () => {
  //get products data
  const { products } = useProducts();
  //save search name
  const [productName, setProductName] = useState('');
  //save search results from backend, if there was no search -> null
  const [searchResults, setSearchResults] = useState(null);

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
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/get-product', {
          params: { name: productName }
        });
        setSearchResults(response.data); //save search results
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
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ProductList;