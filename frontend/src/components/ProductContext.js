import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const ProductContext = createContext();
export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);


  // Функція для отримання продуктів з бекенду
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-all-product');
      setProducts(response.data); // Зберігаємо отримані продукти у стан
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };


  // Виклик fetchProducts при першому завантаженні компонента
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);