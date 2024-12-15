/*  Author : Maryna Kucher 
    Login : xkuche01      */
import React, { useState } from 'react';
import { format } from 'date-fns';
import './ProductList.css';
import axios from "axios";

//product edit section
const ProductEdit = ({ product, handleCancelEdit }) => {

  const [updatedProduct, setUpdatedProduct] = useState({ ...product });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct((prevState) => ({
      ...prevState,
      [name]: value ? value : null,  // Якщо значення порожнє, встановлюємо null
    }));
  };

  //sending the form
  const handleSave = async () => {
    //check mandatory data
    const { name, amount} = updatedProduct;
    if (!name ) {
      alert('Please fill the product name');
      return;
    }
    if(!amount){
      updatedProduct.amount = 0;
    }
    try {
      //request to backend
      const response = await axios.put(`http://localhost:5000/update-product/${updatedProduct.id}`, {
        ...updatedProduct,
        //set correct data format (if data is set)
        expiration_date: updatedProduct.expiration_date ? format(updatedProduct.expiration_date, 'yyyy-MM-dd') : null, 

      });

      if (response.status === 200) {
        //close editing form if status is ok
        console.log('Updated Product:', updatedProduct);
        handleCancelEdit(); //call function to reset editing state
    
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  //cancel button handler
  const handleCancel = () => {
    handleCancelEdit(); //call function to reset editing state
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
          required
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
          // show previous checkbox state if available
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
          // show previous date if available
          value={updatedProduct.expiration_date ? format(new Date(updatedProduct.expiration_date), 'yyyy-MM-dd') : ''}
          onChange={handleChange}
          className="edit-input"
        />
      </label>
      </div>
      {/* edit and sve buttons */}
      <div className="product-actions-edit">
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>

    </div>
  );
};

export default ProductEdit;
