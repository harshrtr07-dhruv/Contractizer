import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import RegisterCard from '../components/auth/RegisterCard';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(undefined);
      // We pass access_token since we're using the implicit flow hook
      const result = await googleLogin(tokenResponse.access_token);
      setLoading(false);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    },
    onError: () => {
      setError('Google Auth Failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[var(--color-paper,#DCEEEA)]">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
        style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#12181A)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        BACK
      </button>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[400px]"
      >
        <RegisterCard 
          onGoogleLogin={() => login()} 
          loading={loading} 
          error={error}
        />
      </motion.div>
    </div>
  );
};

export default RegisterPage;
