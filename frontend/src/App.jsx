/*  Author : Maryna Kucher, xkuche01 
    Author : Bilyk Vladyslava, xbilyk03 */
import './App.css'
import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import appIcon from './images/app_icon.JPG'; 
import AddProduct from './components/AddProduct.jsx';
import { ProductProvider } from './components/ProductContext.jsx';
import ProductList from './components/ProductList.jsx';
import Dish from './components/Dish.jsx';
import MealCalendar from './components/MealCalendar.jsx';
import ShoppingList from './components/ShoppingList.jsx';


function App() {
  const [activeSection, setActiveSection] = useState('calendar'); 

  // Represents all section
  const calendarRef = useRef(null);
  const productsRef = useRef(null);
  const shoppingListRef = useRef(null);
  const dishesRef = useRef(null);

  // Function to track scrolling and identify the active section.
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2; 

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

  // Function for smooth scrolling to a specific section.
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

      {/* provider covers all sections to allow asynchronous updating of the product list */}
      <ProductProvider>
      <section ref={calendarRef} id="calendar"> 
        <h2>Calendar</h2>
        <MealCalendar />

      </section>
      <section ref={productsRef} id="products"> 

          <AddProduct />
          <ProductList />

      </section>
      <section ref={shoppingListRef} id="shoppingList"> 
        <ShoppingList />
      </section>
      <section ref={dishesRef} id="dishes"> 
        <Dish/>
      </section>
      </ProductProvider>
    </div>
  )
}

export default App
