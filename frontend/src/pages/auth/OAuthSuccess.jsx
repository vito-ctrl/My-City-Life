import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    localStorage.setItem('token', token);
    navigate('/');
    console.log('OAuth login success');

  }, [navigate]);

  return <div className="text-white p-8">Logging in...</div>;
};

export default OAuthSuccess;
