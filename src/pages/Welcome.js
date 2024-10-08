import { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode"; // import jwtDecode properly
import axios from 'axios'; // or use fetch if you prefer
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { backend } from '../data';

import { UserContext } from '../context/UserContext';

function Welcome() {

    const { setUser } = useContext(UserContext);
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    const handleLoginSuccess = async (credentialResponse) => {
        try {
            const decodedData = jwtDecode(credentialResponse.credential);
            console.log(decodedData); // Check what is being decoded

            // Send name and email to the backend
            const response = await axios.post(`${backend}/api/auth/user`, {
                googleId: credentialResponse.credential,
                name: decodedData.name,
                email: decodedData.email
            });

            console.log('User saved successfully:', response.data);

            setUser(response.data);

            navigate('/dashboard');

        } catch (error) {
            console.error('Error decoding token or saving user:', error);
        }
    };

    return (
        <div>
            <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => {
                    console.log('Login Failed');
                }}
            />
        </div>
    );
}

export default Welcome;
