import React, {useState} from 'react';
import { useProducts } from './ProductContext.jsx';
import ProductEdit from './ProductEdit';
import { format } from 'date-fns';

import './ProductList.css';
import axios from "axios";

const ProductList = () => {
  //get products data
  const { products } = useProducts();

  const { fetchProducts } = useProducts();
  //save search name
  const [productName, setProductName] = useState('');
  //save search results from backend, if there was no search -> null
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const [editingProductId, setEditingProductId] = useState(null);


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
       

        if (response.data.length === 0) {
          setSearchResults([]);
          setNoResults(true);
        } else {
          setSearchResults(response.data); //save search results
          setNoResults(false);
        }
      } catch (error) {

        setSearchResults([]);
        setNoResults(true);

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

 
  const handleEditClick = (productId) => {
    setEditingProductId(productId);
  };
  const handleCancelEdit = () => {
    setEditingProductId(null); // Скидаємо редагування
    fetchProducts();
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

      {/*if search results not empty show them, otherwise show all products*/}
      <div className="product-list">
        {noResults ? (
          // Пошуковий запит є, але результати порожні
          <p>Not found</p>
        ) : (
          // Якщо є результати пошуку, показати їх, інакше показати всі продукти
          (searchResults && searchResults.length > 0 ? searchResults : products).map((product) => (
            <div className={`product-item ${editingProductId === product.id ? 'editing' : ''}`}>
            {editingProductId === product.id ? (
              // Якщо цей продукт редагується, показуємо форму редагування
              <ProductEdit product={product} handleCancelEdit={handleCancelEdit} />
            ) : (
              <>
              <h3 className="product-name">{product.name}</h3>
              <div className="product-details">
                <p>Amount: {product.amount} {product.unit}  (reserved for Meal Plan: {product.reserved_amount})</p>
                <p>Price: {product.price}$</p>
                <p>Lactose Free: {product.lactose_free ? 'Yes' : 'No'}</p>
                <p>Gluten Free: {product.gluten_free ? 'Yes' : 'No'}</p>
                <p>Vegan: {product.vegan ? 'Yes' : 'No'}</p>
                {product.expiration_date && (
                  <p>Expiration Date: {format(new Date(product.expiration_date), 'yyyy-MM-dd')}</p>
                )}
              </div>
              <div className="product-actions">
                <i className="fas fa-trash delete-icon" onClick={() => handleDeleteProduct(product.id)}></i>
                <i className="fas fa-edit edit-icon" onClick={() => handleEditClick(product.id)}></i>
              </div>
              </>
            )}
          </div>
          ))
        )}
      </div>


    </div>
  );
}

export default ProductList;