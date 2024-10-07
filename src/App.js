import React from 'react'
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Semesters from './pages/Semesters';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Welcome />}/>
        <Route path='/home' element={<Home />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/semesters' element={<Semesters />}/>
      </Routes>
    </div>
  )
}

export default App;
