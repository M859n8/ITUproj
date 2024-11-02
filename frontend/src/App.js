//import logo from './logo.svg';
//import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import AddProduct from './components/AddProduct';
import SearchProduct from './components/SearchProduct';


function App() {

  return (
      <div>
        <SearchProduct/>
        <AddProduct />
      </div>
  );
}

export default App;

