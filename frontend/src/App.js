//import logo from './logo.svg';
//import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/')
        .then((response) => response.text())
        .then((data) => setMessage(data));
  }, []);
  return (
    <div className="App">
      message
    </div>
  );


}

export default App;
