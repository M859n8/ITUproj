/* Autor: Bilyk Vladyslava */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShoppingList.css';

// Representation of Shopping list section
const ShoppingList = () => {
    // Product name that user updating
    const [editingProductName, setEditingProductName] = useState(null); 
    // Product new amount
    const [newAmount, setNewAmount] = useState(''); 
    // Name of the product that the user is looking for
    const [searchQuery, setSearchQuery] = useState('');
    // Error for searching result
    const [error, setError] = useState('');
    // Error for selecting product in form
    const [errorSelect, setErrorSelect] = useState('');
    // Error for creating product in form
    const [errorCreate, setErrorCreate] = useState('');
    // Array of products from table Product in select in form
    const [existingProducts, setExistingProducts] = useState([]); 
    // Existing product that user want to add to shopping list
    const [selectedProduct, setSelectedProduct] = useState(''); 
    // Amount for selected product? that user want to add
    const [selectedAmount, setSelectedAmount] = useState('');
    // All products in Shopping list table
    const [shoppingList, setShoppingList] = useState([]); 
    // Variable that save form state - open or close
    const [isModalOpen, setModalOpen] = useState(false);
    // Variable for data for new product in list
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

    // Function for showing all product in list
    const fetchList = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-all-shopping-list');
            if (Array.isArray(response.data)) {
                setShoppingList(response.data);
            } else { // If there no product in table Shopping list
                setShoppingList([]); 
            }     
        } catch (error) {
            console.error('Error fetching list:', error);
        }
    };

    // Get all products in list when this component is loaded
    useEffect(() => {
        fetchList();
    }, []);

    // Get all products from table Product when this component is loaded
    useEffect(() => {
        axios.get('http://localhost:5000/get-all-product')
            .then(response => setExistingProducts(response.data))
            .catch(error => console.error('Error fetching all products:', error));
    }, []);

  // Function that handle search in list
  const handleSearch = async () => {
        try {
            setError('');
            const response = await axios.get(`http://localhost:5000/get-product-from-list/${searchQuery}`);
            setShoppingList(response.data); 
        } catch (err) {
            setError('No such product in shopping list');
            setShoppingList([]);
        }
  };

  // Function that handle opening and closing the form
  const handleModalToggle = () => {
    setErrorSelect('');
    setModalOpen(!isModalOpen);
  }

  // Function that fill 'newProduct' with new data
  const handleNewProductChange = (field, value) => {
        setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  // Function that handle selecting existing product in the form
  const handleSelect = async (event) => {
    event.preventDefault(); // Overrides the form's default behavior
    setErrorSelect('');
    if (selectedProduct && selectedAmount) { // If product was selected and filled input for amount
        try {
            // Get data from table Product, about this product
            const response = await axios.get('http://localhost:5000/get-product', {
                params: { name: selectedProduct }
            });
            const productToAdd = response.data[0]; // Get only first product from array

            if (productToAdd) {
                // Change date - delete time from datetime
                const expirationDate = productToAdd.expiration_date
                ? new Date(productToAdd.expiration_date).toISOString().split('T')[0] 
                : null;

                const productData = {
                    name: selectedProduct,
                    amount: parseInt(selectedAmount) || 0, 
                    unit: productToAdd.unit || null,
                    price: productToAdd.price || null,
                    lactose_free: productToAdd.lactose_free,
                    gluten_free: productToAdd.gluten_free,
                    vegan: productToAdd.vegan,
                    expiration_date: expirationDate || null,
                };

                await axios.post('http://localhost:5000/add-to-shopping-list', productData);
            }
            fetchList();
        } catch (error) {
            console.error('Error getting product or adding to shopping list:', error);
        }
        // Close form
        handleModalToggle();
    }  else {
        setErrorSelect('Please fill out amount and select product');
    }
    // Clear variable for next form
    setSelectedProduct('');
    setSelectedAmount('');
  };

  // Function that handle creating new product
  const handleSubmit = async (event) => {
    event.preventDefault(); // Overrides the form's default behavior
    setErrorCreate('');
    if (newProduct.name && newProduct.amount) { // If user fill name and amount - add product
        try {
            await axios.post('http://localhost:5000/add-to-shopping-list', newProduct);
            fetchList();
        } catch (error) {
            console.error('Error adding new product to shopping list:', error);
        }
        handleModalToggle(); // Close form
    } else {
        setErrorCreate('Please fill out name and amount');
    }

    // Clear variable for the next form
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
};

  // Function that handle marking the product as purchased
  const handleWasBought = async (productName, updatedAmount) => {
    try {
        // Check if this name product exist
        const response = await axios.get('http://localhost:5000/get-product', {
            params: { name: productName }
        });

        if (response.data) {
            // If product exist in table Product - only update amount
            await axios.post('http://localhost:5000/update-product-amount', {
                name: productName,
                amount: updatedAmount
            });
        }
    } catch (error) {
        // If such product did not exist
        if (error.response && error.response.status === 404) {
            try {
                // Get data about product from table Shopping list that was bought
                const response1 = await axios.get(`http://localhost:5000/get-product-from-list/${productName}`);
                const productFromList = response1.data[0];
                // Change datetime to date
                const expirationDate = productFromList.expiration_date
                ? new Date(productFromList.expiration_date).toISOString().split('T')[0]
                : null;
                // Add product to the table Product
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
                console.log("Added");
            } catch (err) {
                console.error(`Error processing product getting or adding product:`, err.message);
            }
        }
    }

    // Delete product from shopping list
    await axios.delete('http://localhost:5000/delete-from-shopping-list', {
        data: { name: productName }
    });
    fetchList();
  };

  // Function that handle deleting product from list
  const handleDelete = async (productName) => {
    try{
        await axios.delete('http://localhost:5000/delete-from-shopping-list', {
            data: { name: productName }
        });
        fetchList(); // Refresh list of product
    } catch(error){
        console.error(`Error deleting product from list:`, error.message);
    }
  }

  // Function that handle updating the product
  const handleUpdate = async (productName, updatedAmount) => {
    try {
        await axios.post('http://localhost:5000/update-product-from-list', {
            name: productName,
            amount: updatedAmount,
        });

        fetchList();// Refresh product list
        // Clear variable for updating
        setEditingProductName(null);
        setNewAmount('');
    } catch (error) {
        console.error('Error updating product:', error.message);
    }
};


  return (
    <div className="shoppingList">
      <h2>Shopping List</h2>
      {/* -------------SEARCH BAR--------------- */}
       <div className="shopping-list-header">
            <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>
                <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            <button className="add-product-button" onClick={handleModalToggle}>+ Add Product</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* -------------LIST OF PRODUCT--------------- */}
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
                    {/* -------------EDITING MODE--------------- */}
                    <div>
                        {editingProductName === product.name ? (
                            <button
                                onClick={() => handleUpdate(product.name, newAmount)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <i className="fas fa-check"></i>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setEditingProductName(product.name);
                                    setNewAmount(product.amount);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        )}
                    <button
                        onClick={() => handleDelete(product.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <i className="fa-solid fa-trash-can"></i>
                    </button>
                    <input
                        type="checkbox"
                        onChange={() => handleWasBought(product.name, product.amount)}
                    />
                  </div>
                </li>
            ))}
        </ul>

      {/* -------------FORM--------------- */}
      {isModalOpen && (
        <div className="modal">
            <div className="modal-overlay" onClick={handleModalToggle}></div>
            <div className="modal-content">
                <button className="close-button" onClick={handleModalToggle}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <div className="form-container">
                    {/* -------------SELECT--------------- */}
                    <div className="form-section">
                        <h3>Add Existing Product</h3>
                        <p>* - required fields</p>
                        <select
                            className="product-select"
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">Select Product *</option>
                            {existingProducts.map(product => (
                                <option key={product.id} value={product.name}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount *"
                            value={selectedAmount}
                            onChange={(e) => setSelectedAmount(e.target.value)}
                        />
                        {errorSelect && <p style={{ color: 'red' }}>{errorSelect}</p>}
                        <button className="submit-button" onClick={handleSelect}>
                            Add Selected Product
                        </button>
                    </div>
                    <div className="form-divider"></div>
                    {/* -------------CREATE--------------- */}
                    <div className="form-section">
                        <h3>Create New Product</h3>
                        <p>* - required fields</p>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Name *"
                                value={newProduct.name}
                                onChange={(e) => handleNewProductChange('name', e.target.value)}
                                required
                            />
                            {errorCreate && <p style={{ color: 'red' }}>{errorCreate}</p>}
                            <input
                                type="number"
                                placeholder="Amount *"
                                value={newProduct.amount}
                                onChange={(e) => handleNewProductChange('amount', e.target.value)}
                                required
                            />
                            {errorCreate && <p style={{ color: 'red' }}>{errorCreate}</p>}
                            <input
                                type="text"
                                placeholder="Unit (e.g., kg, pcs)"
                                value={newProduct.unit}
                                onChange={(e) => handleNewProductChange('unit', e.target.value)}
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
