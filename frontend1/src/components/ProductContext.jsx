// Author : Maryna Kucher 
// Login : xkuche01
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
//context will pass the data between components
const ProductContext = createContext();
export const ProductProvider = ({ children }) => {
  //products -state for data storing
  //setProducts - function for updating data
  const [products, setProducts] = useState([]);


  //asynchronous function that sends a request to the backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-all-product');
      setProducts(response.data); //save products in state
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };


  //call function for first component use
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    //provides access to products and fetchProducts for all child components wrapped in ProductProvider
    <ProductContext.Provider value={{ products, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);