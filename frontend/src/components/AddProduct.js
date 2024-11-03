import React, { useState } from 'react';
import axios from 'axios';
import { useProducts } from './ProductContext';
function AddProduct() {
    const { fetchProducts } = useProducts();
    // Стани для відображення форми та збереження значень полів
    const [showForm, setShowForm] = useState(false);
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

    // Показати або приховати форму
    const handleAddProductClick = () => {
        setShowForm(true);
    };

    // Функція для оновлення полів у формData
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };


    // Обробник відправки форми
    const handleAddItem = async (event) => {
        event.preventDefault(); // Prevents the default form submission

        // Перевірка обов'язкових полів
        const { name, amount, unit, price } = product;

        if (!name || !amount || !unit || !price) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            // Надсилання POST-запиту на бекенд
            await axios.post('http://localhost:5000/add-product', {
                ...product,
                amount: parseInt(product.amount),
                price: parseFloat(product.price),
                expiration_date: product.expiration_date || null
            });
            //alert(response.data); // Показуємо повідомлення про успішне додавання
        // Виконайте будь-які дії з даними продукту (відправка на сервер тощо)
        setShowForm(false); // Закрити форму після додавання продукту
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
            // Оновлення списку продуктів
            fetchProducts();
        } catch (error) {
            alert('Error adding item: ' + (error.response?.data || error.message));
        } // Очистити форму
    };

    return (
        <div>
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
                            required
                        />
                        <input
                            type="number"
                            name="amount"
                            value={product.amount}
                            onChange={handleChange}
                            placeholder="Enter amount"
                        />
                        <input
                            type="text"
                            name="unit"
                            value={product.unit}
                            onChange={handleChange}
                            placeholder="Enter unit (e.g., kg, liter)"
                        />
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
                    </div>
                    <button type="submit">Add Product</button>
                </form>
            )}
        </div>
    );
}

export default AddProduct;
