import React, { useState } from 'react';
import axios from 'axios';
import { useProducts } from './ProductContext.jsx';
function AddProduct() {
  //import fetch products to update list after insertion
  const { fetchProducts } = useProducts();
  //state for showing form
  const [showForm, setShowForm] = useState(false);
  //state for product data
  const [product, setProduct] = useState({
    name: '',
    amount: '',
    unit: '',
    price: '',
    lactose_free: false,
    gluten_free: false,
    vegan: false,
    expiration_date: '',
  });

  //show or hide form
  const handleAddProductClick = () => {
    if(showForm){
      setShowForm(false);
    }else{
      setShowForm(true);
    }
  };

  //update new product values
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
      
    }));
  };


  //send data to backend
  const handleAddItem = async (event) => {
    event.preventDefault(); //prevents the default form submission

    //check mandatory data
    const { name, amount, unit, price } = product;
    if (!name || !amount || !unit || !price) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await axios.post('http://localhost:5000/add-product', {
        ...product,
        amount: parseInt(product.amount),
        price: parseFloat(product.price),
        
        expiration_date: product.expiration_date || null
      });
      setShowForm(false); //close form
      setProduct({
        name: '',
        amount: '',
        unit: '',
        price: '',
        lactose_free: false,
        gluten_free: false,
        vegan: false,
        expiration_date: '',
      });
      //upd product list
      await fetchProducts();
    } catch (error) {
      alert('Error adding item: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div className="parent">
      <div className="section-header">
        <h2>YOUR PRODUCTS</h2>
        <button onClick={handleAddProductClick} className="addButton">+</button>
      </div>
      {showForm && (
        <form onSubmit={handleAddItem} >

          <div className="show-form">
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
            <input
              type="number"
              name="amount"
              value={product.amount}
              onChange={handleChange}
              placeholder="Enter amount"
            />
            <select
              name="unit"
              value={product.unit}
              onChange={handleChange}
            >
              <option value="">Select unit</option>
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="piece">piece</option>
              <option value="-">-</option>
            </select>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="Enter price"
            />
            <label>
              <input
                type="checkbox"
                name="lactose_free"
                checked={product.lactose_free}
                onChange={handleChange}
              />
              Lactose Free
            </label>
            <label>
              <input
                type="checkbox"
                name="gluten_free"
                checked={product.gluten_free}
                onChange={handleChange}
              />
              Gluten Free
            </label>
            <label>
              <input
                type="checkbox"
                name="vegan"
                checked={product.vegan}
                onChange={handleChange}
              />
              Vegan
            </label>
            <label>
              <input
                type="date"
                name="expiration_date"
                value={product.expiration_date}
                onChange={handleChange}
                placeholder="Enter expiration date"
              />
            </label>
            <button type="submit">Add Product</button>
          </div>
        </form>
      )}
    </div>

  );
}

export default AddProduct;
