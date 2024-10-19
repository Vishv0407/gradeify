import React, { useEffect } from 'react'
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Semesters from './pages/Semesters';
import { UserProvider } from './context/UserContext';
import ReactGA from 'react-ga4';
ReactGA.initialize('G-SCGDKHP04J');

function App() {

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return (
    <UserProvider>
      <Routes>
        <Route path='/' element={<Welcome />}/>
        <Route path='/home' element={<Home />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/semesters' element={<Semesters />}/>
      </Routes>
    </UserProvider>
  )
}

export default App;
