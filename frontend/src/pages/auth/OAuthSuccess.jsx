import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentProfile } from '../../services/profile';
import { setAuthSession } from '../../utils/auth';

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeOAuthLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setAuthSession({ token });

      try {
        await fetchCurrentProfile(token);
      } catch (error) {
        console.error('OAuth login success but profile preload failed', error);
      }

      navigate('/', { replace: true });
      console.log('OAuth login success');
    };

    completeOAuthLogin();
  }, [navigate]);

  return <div className="text-white p-8">Logging in...</div>;
};

export default OAuthSuccess;
