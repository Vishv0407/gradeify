// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { backend } from '../data';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Retrieve user from localStorage on initial load
        const storedUser = localStorage.getItem('user');
        try {
            return storedUser ? JSON.parse(storedUser) : null; // Parse if exists, else null
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            return null; // Return null if parsing fails
        }
    });

    const [semesters, setSemesters] = useState([]);

    // Fetch user data when the component mounts or user changes
    const fetchUserData = async (email) => {
        try {
            const response = await axios.post(`${backend}/api/auth/getUser`, { email });
            const userData = response.data;

            // Ensure userData is valid before setting it
            if (userData && typeof userData === 'object') {
                setUser(userData); // Set the fetched user data
                setSemesters(userData.semesters || []); // Set semesters from the user data

                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify(userData)); // Store in localStorage

            } else {
                console.error('Invalid user data:', userData);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Load user data from localStorage and set it in state
    useEffect(() => {
        if (user && user.email) {
            fetchUserData(user.email);
        }
    }, [user?.email]); // Only fetch if email changes

    // Clear user data on logout
    const logout = () => {
        setUser(null);
        setSemesters([]);
        localStorage.removeItem('user'); // Remove user from localStorage
    };

    return (
        <UserContext.Provider value={{ user, semesters, setUser, setSemesters, fetchUserData, logout }}>
            {children}
        </UserContext.Provider>
    );
};
