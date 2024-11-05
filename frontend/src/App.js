//import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import appIcon from './images/app_icon.JPG'; // Імпорт зображення
import AddProduct from './components/AddProduct';
import { ProductProvider } from './components/ProductContext';
import ProductList from './components/ProductList';
//import ProductsSection from './components/ProductsSection';
import AddDish from './components/AddDish';
import SearchDish from './components/SearchDish';
import './components/SearchDish.css';

function App() {
  // -----------Create Vlada for dish button
  const [dishes, setDishes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
      setIsFormOpen(!isFormOpen);
  };

   // Функція для отримання всіх страв
   const fetchDishes = async () => {
      try {
          const response = await axios.get('/get-all-dishes');
          setDishes(response.data);
          // console.log('Dishes:', response.data);
      } catch (error) {
          console.error('Error fetching dishes:', error);
      }
  };

  useEffect(() => {
      fetchDishes(); // Отримуємо страви при завантаженні компонента
  }, []);
  // ------------------End Vlada code

  const [activeSection, setActiveSection] = useState('calendar'); // Стан для активної секції

  // Створюємо рефи для кожної секції
  const calendarRef = useRef(null);
  const productsRef = useRef(null);
  const shoppingListRef = useRef(null);
  const dishesRef = useRef(null);

  // Функція для відстеження скролу та визначення активної секції
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2; // Поточна позиція скролу

      if (dishesRef.current && scrollPosition >= dishesRef.current.offsetTop) {
        setActiveSection('dishes');
      } else if (shoppingListRef.current && scrollPosition >= shoppingListRef.current.offsetTop) {
        setActiveSection('shoppingList');
      } else if (productsRef.current && scrollPosition >= productsRef.current.offsetTop) {
        setActiveSection('products');
      } else if (calendarRef.current) {
        setActiveSection('calendar');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Функція для плавного скролу до певної секції
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
    <nav className="navbar">
      <img src={appIcon} alt="Logo" className="logo" /> 
      <h1 className="app-name">Ratatouille</h1>
      <button
        className={`calendar-button ${activeSection === 'calendar' ? 'active' : ''}`}
        onClick={() => scrollToSection(calendarRef)}
      >
        Calendar
      </button>
      <button
        className={`other-button ${activeSection === 'products' ? 'active' : ''}`}
        onClick={() => scrollToSection(productsRef)}
      >
        Your products
      </button>
      <button
        className={`other-button ${activeSection === 'shoppingList' ? 'active' : ''}`}
        onClick={() => scrollToSection(shoppingListRef)}
      >
        Shopping list
      </button>
      <button
        className={`other-button ${activeSection === 'dishes' ? 'active' : ''}`}
        onClick={() => scrollToSection(dishesRef)}
      >
        Dishes
      </button>
    </nav>

    {/* Секції сторінки */}
    <section ref={calendarRef} id="calendar"> {/* Зона "Calendar" */}
      <h2>Calendar</h2>
      {/* Вміст календаря */}
    </section>
    <section ref={productsRef} id="products"> {/* Зона "Your products" */}

      <ProductProvider>
        <AddProduct />
      </ProductProvider>



      {/*<SearchProduct/>*/}

      <ProductProvider>
        <ProductList />
      </ProductProvider>

    </section>
    <section ref={shoppingListRef} id="shoppingList"> {/* Зона "Shopping list" */}
      <h2>Shopping List</h2>
      {/* Вміст списку покупок */}
    </section>
    <section ref={dishesRef} id="dishes"> {/* Зона "Dishes" */}
      <h2>Dishes</h2>
      <button onClick={toggleForm}>Add dish</button>
      {isFormOpen && <AddDish onClose={toggleForm} fetchDishes={fetchDishes}/>}
      <SearchDish/>
      {/* Вміст для страв */}
      <div className="dish-results">
            {dishes.map((dish) => (
                <div key={dish.id} className="dish-card">
                    <h3>{dish.name}</h3>
                    <p>Difficulty: {dish.difficulty_level}</p>
                    <p>Cooking time: {dish.cooking_time}</p>
                    {dish.is_lactose_free && <p>Lactose-free</p>}
                    {dish.is_gluten_free && <p>Gluten-free</p>}
                    {dish.is_vegan && <p>Vegan</p>}
                    <p>Ingredients:</p>
                    {/* <ul>
                        {dish.ingredients.map((ingredient, i) => (
                            <li key={i}>{ingredient.product_name} ({ingredient.required_amount} {ingredient.unit})</li>
                        ))}
                    </ul> */}
                </div>
            ))}
        </div>
    </section>
  </div>
  );
}

export default App;

