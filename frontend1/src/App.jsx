import './App.css'
import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import appIcon from './images/app_icon.JPG'; 
import AddProduct from './components/AddProduct.jsx';
import { ProductProvider } from './components/ProductContext.jsx';
import ProductList from './components/ProductList.jsx';
import AddDish from './components/AddDish.jsx';
import SearchDish from './components/SearchDish.jsx';
import './components/SearchDish.css';

function App() {
  // VLADYSLAVA
  const [dishes, setDishes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
      setIsFormOpen(!isFormOpen);
  };

   // Function for showing all dishes
  const fetchDishes = async (searching = false) => {
      try {
          if (searching) {
              setDishes([]); // clear list of dishes? when searching
          } else{
              const response = await axios.get('http://localhost:5000/get-all-dishes');
              if (Array.isArray(response.data)) {
                setDishes(response.data);
              } else {
                  console.error('Expected an array, but received:', response.data);
                  setDishes([]); // Set empty array in case of unexpected response
              }
            }          
      } catch (error) {
          console.error('Error fetching dishes:', error);
      }
  };

  useEffect(() => {
      fetchDishes(); // Retrieve dishes when the component loads
  }, []);

  const handleDelete = async (id) => {
    try {
        await axios.delete(`http://localhost:5000/delete-dish/${id}`);
        // Show all dishes except for the deleted one
        setDishes(dishes.filter(dish => dish.id !== id));
    } catch (error) {
        console.error('Error deleting the dish:', error);
    }
  };
  // VLADYSLAVA

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

      {/* Section of page */}
      <section ref={calendarRef} id="calendar"> 
        <h2>Calendar</h2>
      </section>
      <section ref={productsRef} id="products"> 

        <ProductProvider>
          <AddProduct />
          <ProductList />
        </ProductProvider>

      </section>
      <section ref={shoppingListRef} id="shoppingList"> 
        <h2>Shopping List</h2>
      </section>
      <section ref={dishesRef} id="dishes"> 
        <h2>Dishes</h2>
        <button onClick={toggleForm}>Add dish</button>
        {isFormOpen && <AddDish onClose={toggleForm} fetchDishes={fetchDishes}/>}
        <SearchDish fetchDishes={fetchDishes}/>
        {/* Dishes*/}
        <div className="dish-results">
              {dishes.map((dish) => (
                  <div key={dish.id} className="dish-card">
                      <button className="delete-button" onClick={() => handleDelete(dish.id)}>🗑️</button>
                      <h3>{dish.name}</h3>
                      <p>Difficulty: {dish.difficulty_level}</p>
                      <p>Cooking time: {dish.cooking_time}</p>
                      {dish.is_lactose_free && <p>Lactose-free</p>}
                      {dish.is_gluten_free && <p>Gluten-free</p>}
                      {dish.is_vegan && <p>Vegan</p>}
                      <p>Ingredients:</p>
                      <ul>
                          {dish.ingredients.map((ingredient, i) => (
                              <li key={i}>{ingredient.product_name} ({ingredient.required_amount} {ingredient.unit})</li>
                          ))}
                      </ul>
                  </div>
              ))}
          </div>
      </section>
    </div>
  )
}

export default App
