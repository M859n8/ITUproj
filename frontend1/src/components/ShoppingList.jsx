import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShoppingList.css';

const ShoppingList = () => {
    const [editingProductName, setEditingProductName] = useState(null); // Продукт, який редагується
    const [newAmount, setNewAmount] = useState(''); // Нове значення кількості
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [existingProducts, setExistingProducts] = useState([]); // product in select form
    const [selectedProduct, setSelectedProduct] = useState(''); 
    const [selectedAmount, setSelectedAmount] = useState('');
    const [shoppingList, setShoppingList] = useState([]); // all shopping list
    const [isModalOpen, setModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        amount: '',
        unit: '',
        price: '',
        lactose_free: false,
        gluten_free: false,
        vegan: false,
        expiration_date: '',
    });

    const fetchDishes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-all-shopping-list');
            if (Array.isArray(response.data)) {
                setShoppingList(response.data);
            } else {
                console.error('Expected an array, but received:', response.data);
                setShoppingList([]); // Set empty array in case of unexpected response
            }     
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

  // Отримання всіх продуктів зі списку
    useEffect(() => {
        fetchDishes();
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/get-all-product')
            .then(response => setExistingProducts(response.data))
            .catch(error => console.error('Error fetching all products:', error));
    }, []);

  // Обробка пошуку
  const handleSearch = async () => {
        try {
            setError('');
            const response = await axios.get(`http://localhost:5000/get-product-from-list/${searchQuery}`);
            setShoppingList(response.data); 
            // setShoppingList([response.data]); 
        } catch (err) {
            setError('No such product in shopping list');
            setShoppingList([]);
        }
  };

  // Обробка відкриття модального вікна для додавання продукту
  const handleModalToggle = () => setModalOpen(!isModalOpen);
  const handleNewProductChange = (field, value) => {
        setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleSelect = async (event) => {
    event.preventDefault();
    if (selectedProduct && selectedAmount) {
        try {
            // Отримуємо інформацію про існуючий продукт
            const response = await axios.get('http://localhost:5000/get-product', {
                params: { name: selectedProduct }
            });
            const productToAdd = response.data[0]; // Припускаємо, що відповідь містить один продукт

            if (productToAdd) {
                const expirationDate = productToAdd.expiration_date
                ? new Date(productToAdd.expiration_date).toISOString().split('T')[0] // Залишаємо тільки дату
                : null;
                const productData = {
                    name: selectedProduct,
                    amount: parseInt(selectedAmount) || 0, // delete ||0 and test
                    unit: productToAdd.unit,
                    price: productToAdd.price,
                    lactose_free: productToAdd.lactose_free,
                    gluten_free: productToAdd.gluten_free,
                    vegan: productToAdd.vegan,
                    expiration_date: expirationDate || null,
                };

                // console.log('Product data to be sent:', productData);

                // Додаємо продукт до шопінг-лісту
                await axios.post('http://localhost:5000/add-to-shopping-list', productData);
                // console.log('Product added to shopping list');
            }
            fetchDishes();
        } catch (error) {
            console.error('Error fetching product or adding to shopping list:', error);
        }
    }  else {
        console.log('Please fill out the required fields');
    }
    setSelectedProduct('');
    setSelectedAmount('');
    handleModalToggle();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newProduct.name && newProduct.amount) {
        try {
            // Додаємо новий продукт до шопінг-лісту
            await axios.post('http://localhost:5000/add-to-shopping-list', newProduct);
            // console.log('New product added to shopping list');
            fetchDishes();
        } catch (error) {
            console.error('Error adding new product to shopping list:', error);
        }
    } else {
        console.log('Please fill out the required fields');
    }

    // Очищаємо форму після відправлення
    setNewProduct({
        name: '',
        amount: '',
        unit: '',
        price: '',
        lactose_free: false,
        gluten_free: false,
        vegan: false,
        expiration_date: '',
    });
    handleModalToggle(); // Закриваємо модальне вікно
};


  const handleDelete = async (productName, updatedAmount) => {
    try {
        // Пошук продукту
        const response = await axios.get('http://localhost:5000/get-product', {
            params: { name: productName }
        });

        if (response.data) {
            // Оновлення кількості продукту
            await axios.post('http://localhost:5000/update-product-amount', {
                name: productName,
                amount: updatedAmount
            });
        }
    } catch (error) {
        // Якщо продукт не знайдений, створимо новий продукт
        if (error.response && error.response.status === 404) {
            try {
                const response1 = await axios.get(`http://localhost:5000/get-product-from-list/${productName}`);
                const productFromList = response1.data;
                const expirationDate = productFromList.expiration_date
                ? new Date(productFromList.expiration_date).toISOString().split('T')[0] // Залишаємо тільки дату
                : null;
                // Додаємо продукт в таблицю products
                await axios.post('http://localhost:5000/add-product', {
                    name: productFromList.name,
                    amount: productFromList.amount,
                    unit: productFromList.unit,
                    price: productFromList.price,
                    lactose_free: productFromList.lactose_free,
                    gluten_free: productFromList.gluten_free,
                    vegan: productFromList.vegan,
                    expiration_date: expirationDate
                });
        
                console.log(`Product "${productName}" moved from shopping list to products table.`);
            } catch (listError) {
                console.error(`Error processing product "${productName}":`, listError.message);
            }
        }
    }

    // Видалення продукту з шопінг-лісту
    await axios.delete('http://localhost:5000/delete-from-shopping-list', {
        data: { name: productName }
    });
    fetchDishes();
  };

  const handleUpdate = async (productName, updatedAmount) => {
    try {
        await axios.post('http://localhost:5000/update-product-from-list', {
            name: productName,
            amount: updatedAmount,
        });

        // Оновлення списку
        // setShoppingList((prevList) =>
        //     prevList.map((product) =>
        //         product.name === productName
        //             ? { ...product, amount: updatedAmount }
        //             : product
        //     )
        // );
        fetchDishes();
        // Вийти з режиму редагування
        setEditingProductName(null);
        setNewAmount('');
    } catch (err) {
        console.error('Error updating product:', err);
    }
};


  return (
    <div className="shoppingList">
      <h2>Shopping List</h2>
       <div className="shopping-list-header">
            <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>🔍</button>
            <button className="add-product-button" onClick={handleModalToggle}>+ Add Product</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Список продуктів */}
      <ul className="shopping-list">
            {shoppingList.map(product => (
                <li key={product.name}>
                    <div className="product-info">
                        <span>
                            {product.name}
                            {editingProductName === product.name
                                ? <input
                                    type="number"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    className="product-input"
                                />
                                : ` (${product.amount} ${product.unit})`}
                        </span>
                    </div>

                    <div>
                        {editingProductName === product.name ? (
                            <button
                                onClick={() => handleUpdate(product.name, newAmount)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                ✅
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setEditingProductName(product.name);
                                    setNewAmount(product.amount);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                ✏️
                            </button>
                        )}
                    <input
                        type="checkbox"
                        onChange={() => handleDelete(product.name, product.amount)}
                    />
                  </div>
                </li>
            ))}
        </ul>

      {/* Модальне вікно для додавання нового продукту */}
      {isModalOpen && (
        <div className="modal">
            <div className="modal-overlay" onClick={handleModalToggle}></div>
            <div className="modal-content">
                <button className="close-button" onClick={handleModalToggle}>X</button>
                <div className="form-container">
                    <div className="form-section">
                        <h3>Add Existing Product</h3>
                        <select
                            className="product-select"
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Select Product</option>
                            {existingProducts.map(product => (
                                <option key={product.id} value={product.name}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount"
                            value={selectedAmount}
                            onChange={(e) => setSelectedAmount(e.target.value)}
                        />
                        <button className="submit-button" onClick={handleSelect}>
                            Add Selected Product
                        </button>
                    </div>
                    <div className="form-divider"></div>
                    <div className="form-section">
                        <h3>Create New Product</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Name"
                                value={newProduct.name}
                                onChange={(e) => handleNewProductChange('name', e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newProduct.amount}
                                onChange={(e) => handleNewProductChange('amount', e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Unit (e.g., kg, pcs)"
                                value={newProduct.unit}
                                onChange={(e) => handleNewProductChange('unit', e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={newProduct.price}
                                onChange={(e) => handleNewProductChange('price', e.target.value)}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newProduct.lactose_free}
                                    onChange={(e) => handleNewProductChange('lactose_free', e.target.checked)}
                                />
                                Lactose Free
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newProduct.gluten_free}
                                    onChange={(e) => handleNewProductChange('gluten_free', e.target.checked)}
                                />
                                Gluten Free
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={newProduct.vegan}
                                    onChange={(e) => handleNewProductChange('vegan', e.target.checked)}
                                />
                                Vegan
                            </label>
                            <input
                                type="date"
                                placeholder="Expiration Date"
                                value={newProduct.expiration_date}
                                onChange={(e) => handleNewProductChange('expiration_date', e.target.value)}
                            />
                            <button className="submit-button" onClick={handleSubmit}>Add Created Product</button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )}

    </div>
  );
};

export default ShoppingList;
