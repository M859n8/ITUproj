/*  Author : Maryna Kucher 
    Login : xkuche01      */
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useProducts } from './ProductContext.jsx';


const SingleMeal = ({selectedDate, meal_type}) => {
  //search state 
  const [searchQuery, setSearchQuery] = useState('');
  //selected dish state
  const [selectedDish, setSelectedDish] = useState(null);
  //error state
  const [error, setError] = useState(''); 
  //search results
  const [searchResults, setSearchResults] = useState(null);
  //state for planned dishes for selected date and meal_type
  const [plannedDishes, setPlannedDishes] = useState([]);
  //products that are not enough to plan a meal
  const [insufficientProducts, setInsufficientProducts] = useState([]);
  //state to display "add to shopping list" button
  const[showShoppingButtons, setshowShoppingButtons] = useState(false);
  //fetch product for product list updating
  const { fetchProducts } = useProducts();
  //state for "no result" message
  const [noResultsMessage, setNoResultsMessage] = useState('');

  //fetch planned dishes for the selected meal_type and date
  const fetchPlannedDishes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/meals-for-day', {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'), //change date format
          meal_type,
        },
      });
      //update list of planned dishes
      setPlannedDishes(response.data);
    } catch (error) {
      console.error(`Error fetching ${meal_type} meals:`, error);
      setError('Failed to load planned dishes.');
    }
  };
  useEffect(() => {

    fetchPlannedDishes();
  }, [selectedDate, meal_type]);


  //handle search section 
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleSearch = async (event) => {
    //search after 'enter' is pressed
    if (event.key === 'Enter') {
      //if product name empty, show all products
      if (searchQuery.trim() === '') {
        setSearchResults(null);
        setNoResultsMessage('');
        setError('');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/get-dish', {
          params: { name: searchQuery }
        });
        //if there are no results
        if (response.data.length === 0) {
          setError('');
          setNoResultsMessage('No dishes found');
          setSearchResults([]);
        } else {
          //there are search results
          setError('');
          setNoResultsMessage('');
          setSearchResults(response.data); //save search results
        }
      } catch (error) {
        setNoResultsMessage('No dishes found');
        setSearchResults([]);
      }
    }
  };

  //function that responds to the click of the add button
  const handleAddDish = async (dishId) => {
    try {
      const response = await axios.post('http://localhost:5000/plan-meal', {
        date: format(selectedDate, 'yyyy-MM-dd'), //сonvert the date before sending
        dish_id: dishId,
        meal_type,
      });

      

      //update reserved amount in product list
      fetchProducts();
      //update dishes
      fetchPlannedDishes();
      if (response.status === 201) {

        //set selected dish
        setSelectedDish(dishId);
        //clearing states after successful addition
        setSearchQuery('');
        setSearchResults([]);
        missingProducts('');
        setInsufficientProducts([]);
        setError('');

      }else if (response.status === 200 && response.data.insufficientProducts) {
        //if there are not enough ingredients 
        setSelectedDish(dishId);
        setshowShoppingButtons(true);
        setInsufficientProducts(response.data.insufficientProducts);
        //show message with suggested actions
        const missingProducts = response.data.insufficientProducts
          .map((product) => `${product.name} (required amount: ${product.required_amount}, available: ${product.amount - product.reserved_amount})`)
          .join('\n');
  
        setError(`Not enough ingredients to prepare this dish :\n${missingProducts}\n\n Do you want to add them to your shopping list?`);
        
      }
    
    } catch (error) {
      // console.error('Error planning meal', error);
      setError('Failed to plan meal');
    }
  };

  //if user choose to add product to the shopping list
  const handleAddToShoppingList = async () => {
    try {
      /*backend will add ingredients to the shopping list,
        will reserve ingredients from the available products in list 
        and add the dish to the plan */
      const response = await axios.post('http://localhost:5000/add-multiple-to-shopping-list', {
        insufficientProducts: insufficientProducts,
        dish_id: selectedDish,
        date: format(selectedDate, 'yyyy-MM-dd'), //convert the date
        meal_type,

      });
  
      //update products amounts
      fetchProducts();
      if (response.status === 201) {
      
        //update dishes after insertion
        fetchPlannedDishes();
        //reset the states after successful insertion
        setSelectedDish(null);
        setSearchQuery('');
        setSearchResults([]);
        setInsufficientProducts([]);
        setshowShoppingButtons(false);
      }
    } catch (error) {
      console.error('Error adding products to shopping list:', error);
      setError('Error adding products to shopping list.');

    }
  };
  

  //deleting dishes
  const handleDeleteDish = async (dishId) => {
    try {
      await axios.delete(`http://localhost:5000/delete-planned-dish/${dishId}`, {
        data: { date: format(selectedDate, 'yyyy-MM-dd'), meal_type },
      });
      //update dishes 
      fetchPlannedDishes();
      //update products
      fetchProducts();

    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  //reset state for 'add to shopping list' buttons
  const handleCancel = () => {
    setshowShoppingButtons(false);
    //stop the search, reset states
    setSelectedDish(null);
    setSearchQuery('');
    setSearchResults([]);
    setInsufficientProducts([]);
    setError('');
  };
  

  return (
    <div className="single-meal">
      {/* header for each meal type */}
      <h3>{meal_type.charAt(0).toUpperCase() + meal_type.slice(1)}</h3>
      {/* show planned dishes for selected date */}
      {plannedDishes && plannedDishes.length > 0 ? (
        <ul>
          {plannedDishes.map((dish) => (

            <div className="planned-dish" key={dish.id}>

              <p>{dish.name}</p>
              {/* delete button  */}
              <i className="fas fa-trash delete-icon" onClick={() => handleDeleteDish(dish.id)}></i>
              
            </div>
          ))}
        </ul>

      ) : ( //if there are no planned dishes 
            //show search form
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleSearch}
            className="meal-search"
            placeholder={`Search for ${meal_type} dishes`}
          />
          {/* if there are no results */}
          {noResultsMessage && <p>{noResultsMessage}</p>}
          {/* otherwise show results */}
          {searchResults && searchResults.length > 0 && (
          <>
          {/* show errors or notifications */}
          {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul>
              {searchResults.map((dish) => (
                <div className="planned-dish" key={dish.id}>
                  <li>
                    {dish.name}
                  </li>
                  {/* show 'add to shoping list' buttons if requested */}
                  {selectedDish === dish.id && showShoppingButtons ? (
                  <>
                  <button onClick={handleAddToShoppingList} >Yes</button>
                  <button onClick={handleCancel} >No</button>
                </>
                ) : (
                  // otherwise show add to plan button 
                  <i 
                    className="fas fa-plus add-icon" 
                    onClick={() => handleAddDish(dish.id)}
                  ></i>
                )}
                </div>
              ))}
            </ul>
            </>
          )}
        </div>
      )}

    </div>
  );
};
    
export default SingleMeal;
