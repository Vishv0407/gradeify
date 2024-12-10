import React, { useEffect } from 'react'
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import { UserProvider } from './context/UserContext';
import ReactGA from 'react-ga4';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';

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
        <Route path='/dashboard' element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }/>
        <Route path='/admin/users' element={<AdminUsers />}/>
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </UserProvider>
  )
}

export default App;
