import React from 'react';
import { useProducts } from './ProductContext';

const ProductList = () => {
  const { products } = useProducts();

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-item">
          <h3>{product.name}</h3>
          <p>Amount: {product.amount}</p>
          <p>Unit: {product.unit}</p>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;