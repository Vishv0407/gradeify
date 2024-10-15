import { useContext } from 'react';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google'; // Import useGoogleLogin hook
import { jwtDecode } from "jwt-decode"; // Make sure jwtDecode is imported correctly
import axios from 'axios'; // or use fetch if you prefer
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { backend } from '../data';
import { UserContext } from '../context/UserContext';
import { FcGoogle } from "react-icons/fc";
import { motion } from 'framer-motion';

// Custom Card component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`p-6 bg-white/5 backdrop-blur-sm border border-blue-500/20 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

// Background grid pattern
const GridPattern = () => {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[rgb(1,8,21)] "></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgb(37 99 235 / 0.15) 1px, transparent 1px), 
                          linear-gradient(to right, rgb(37 99 235 / 0.15) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent)'
      }}>
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `linear-gradient(rgb(37 99 235 / 0.15) 1px, transparent 1px), 
                            linear-gradient(to right, rgb(37 99 235 / 0.15) 1px, transparent 1px)`,
          backgroundSize: '160px 160px',
          maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent)'
        }}></div>
      </div>
    </div>
  );
};

const MyCustomButton = ({ onClick, children }) => {
  return (
    <motion.button
      onClick={onClick}
      className="relative overflow-hidden group text-white px-8 py-3 rounded-full text-lg font-semibold uppercase tracking-wide border border-white cursor-pointer backdrop-blur-sm transition-all duration-200 ease-in-out"
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
      <span className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-75" />
    </motion.button>
  );
};

const Welcome = () => {
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
    <div className="min-h-screen bg-[rgb(1,8,21)] text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <GridPattern />
      <main className="w-full max-w-4xl z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-yellow-300">Gradeify</h1>
          <h2 className="text-4xl font-bold mb-4">Calculate Your CGPA with Style</h2>
          <p className="text-xl text-gray-300">Bring your academic journey to life with stunning visuals and real-time calculations.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[
            { title: "Real-time Calculations", description: "Instant SGPA and CGPA updates" },
            { title: "Semester Management", description: "Organize courses effortlessly" },
            { title: "Visual Insights", description: "Intuitive charts and graphs" },
            { title: "Secure & Private", description: "Protected with Google authentication" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white/5 backdrop-blur-sm border-blue-500/20">
                <h3 className="text-xl font-semibold mb-2 text-yellow-300">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className='flex justify-center items-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9}}
          >
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;