import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductsSection = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Функція для отримання продуктів з бекенду
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-all-product');
        setProducts(response.data); // Зберігаємо отримані продукти у стан
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <h3>{product.name}</h3>
            <p>Amount: {product.amount}</p>
            <p>Unit: {product.unit}</p>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsSection;