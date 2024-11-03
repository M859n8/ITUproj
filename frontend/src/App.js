//import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef  } from 'react';
// import axios from 'axios';
import appIcon from './images/app_icon.JPG'; // Імпорт зображення
import AddProduct from './components/AddProduct';
import SearchProduct from './components/SearchProduct';
import ProductsSection from './components/ProductsSection';
import AddDish from './components/AddDish';

function App() {
  // Create Vlada for dish button
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
      setIsFormOpen(!isFormOpen);
  };
  // End Vlada code

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
      <h2>YOUR PRODUCTS</h2>
      <SearchProduct/>
      <ProductsSection/>
      <AddProduct />
    </section>
    <section ref={shoppingListRef} id="shoppingList"> {/* Зона "Shopping list" */}
      <h2>Shopping List</h2>
      {/* Вміст списку покупок */}
    </section>
    <section ref={dishesRef} id="dishes"> {/* Зона "Dishes" */}
      <h2>Dishes</h2>
      <button onClick={toggleForm}>Add dish</button>
      {isFormOpen && <AddDish onClose={toggleForm} />}
      {/* Вміст для страв */}
    </section>
  </div>
  );
}

export default App;

