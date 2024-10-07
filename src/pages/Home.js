import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // To get passed state and navigate

const Home = () => {
  const location = useLocation(); // Get the state from navigation
  const user = location.state?.user; // Safely access user object
  const navigate = useNavigate(); // For navigation

  const handleLogout = () => {
    localStorage.removeItem('user'); // Optional if you're storing user data locally

    // Redirect to the login page (App component)
    navigate('/');
  };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>

      {/* Logout button */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
