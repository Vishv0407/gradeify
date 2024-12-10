import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import toast from 'react-hot-toast';

const PrivateRoute = ({ children }) => {
    const { user } = useContext(UserContext);
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            toast.error('Please login first to access this page', {
                id: 'auth-toast',
            });
        }
    }, [user, location]);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute; 