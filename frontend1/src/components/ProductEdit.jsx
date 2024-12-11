import React, { useState } from 'react';
import { format } from 'date-fns';
import './ProductList.css';
import axios from "axios";

const ProductEdit = ({ product, handleCancelEdit }) => {
  const [updatedProduct, setUpdatedProduct] = useState({ ...product });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct((prevState) => ({
      ...prevState,
      [name]: value ? value : null,  // Якщо значення порожнє, встановлюємо null
    }));
  };

  const handleSave = async () => {
    try {
      // Відправка запиту на оновлення продукту
      const response = await axios.put(`http://localhost:5000/update-product/${updatedProduct.id}`, {
        ...updatedProduct,
        expiration_date: updatedProduct.expiration_date ? format(updatedProduct.expiration_date, 'yyyy-MM-dd') : null, // Якщо дата є, форматуємо її, якщо ні - передаємо null

      });

      if (response.status === 200) {
        // Якщо успішно оновлено, закриваємо форму редагування
        console.log('Updated Product:', updatedProduct);
        handleCancelEdit(); // Викликаємо функцію для скидання стану редагування
    
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleCancel = () => {
    handleCancelEdit(); // Закриваємо форму редагування
    //setEditingProductId(null); // Скидаємо редагування
    //fetchProducts();
  };

  return (
    <div className="product-item-edit" >
      <div className="product-name">
        
      <label>
        <input
          type="text"
          name="name"
          value={updatedProduct.name}
          onChange={handleChange}
          className="edit-input"
        />
      </label>
      </div>
      <div className="product-details">
      <label>
        Amount:
        <input
          type="number"
          name="amount"
          value={updatedProduct.amount}
          onChange={handleChange}
          className="edit-input"
        />
      </label>
      <label>
        Price:
        <input
          type="number"
          name="price"
          value={updatedProduct.price}
          onChange={handleChange}
          className="edit-input"
        />
      </label>
      <label className="checkbox-label">
        Lactose Free:
        <input
          type="checkbox"
          name="lactose_free"
          checked={updatedProduct.lactose_free}
          onChange={() => setUpdatedProduct((prevState) => ({
            ...prevState,
            lactose_free: !prevState.lactose_free
          }))}
          
        />
      </label>
      <label className="checkbox-label">
        Gluten Free:
        <input
          type="checkbox"
          name="gluten_free"
          checked={updatedProduct.gluten_free}
          onChange={() => setUpdatedProduct((prevState) => ({
            ...prevState,
            gluten_free: !prevState.gluten_free
          }))}
        />
      </label>
      <label className="checkbox-label">
        Vegan:
        <input
          type="checkbox"
          name="vegan"
          checked={updatedProduct.vegan}
          onChange={() => setUpdatedProduct((prevState) => ({
            ...prevState,
            vegan: !prevState.vegan
          }))}
        />
      </label>
      <label>
        Expiration Date:
        <input
          type="date"
          name="expiration_date"
          value={updatedProduct.expiration_date ? format(new Date(updatedProduct.expiration_date), 'yyyy-MM-dd') : ''}
    
          onChange={handleChange}
          className="edit-input"
        />
      </label>
      </div>
      <div className="product-actions-edit">
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>

    </div>
  );
};

export default ProductEdit;
