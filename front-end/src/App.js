import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Home />
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;
