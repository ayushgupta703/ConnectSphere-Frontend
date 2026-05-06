import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    
    if (token) {
      // We set the token and then refresh the user profile to get full user data
      setTokenAndUser(token, refreshToken, null).then(() => {
        navigate('/', { replace: true });
      });
    } else {
      console.error('No token found in OAuth callback');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setTokenAndUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Completing secure login...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
