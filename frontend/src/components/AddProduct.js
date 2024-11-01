import React, { useState } from 'react';

function AddProduct() {
    // Стани для відображення форми та збереження значень полів
    const [showForm, setShowForm] = useState(false);
    const [product, setProduct] = useState({
        name: '',
        price: '',
        description: ''
    });

    // Показати або приховати форму
    const handleAddProductClick = () => {
        setShowForm(true);
    };

    // Обробник змін у полях форми
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    // Обробник відправки форми
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Доданий продукт:', product);
        // Виконайте будь-які дії з даними продукту (відправка на сервер тощо)
        setShowForm(false); // Закрити форму після додавання продукту
        setProduct({ name: '', price: '', description: '' }); // Очистити форму
    };

    return (
        <div>
            <button onClick={handleAddProductClick}>Додати продукт</button>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
                    <div>
                        <label>Назва:</label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Ціна:</label>
                        <input
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Опис:</label>
                        <textarea
                            name="description"
                            value={product.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <button type="submit">Зберегти продукт</button>
                </form>
            )}
        </div>
    );
}

export default AddProduct;
