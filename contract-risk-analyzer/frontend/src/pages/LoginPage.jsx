import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldAlert, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [error, setError] = useState('');
  const { googleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    if (!credentialResponse.credential) {
      setError('Google Sign-In failed. Missing credential.');
      return;
    }

    const res = await googleLogin(credentialResponse.credential);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center">
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 text-indigo-400">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">Contractizer</h1>
          <p className="text-xs text-slate-400 mt-1 mb-8 max-w-xs leading-relaxed">
            AI-powered commercial contract risk analysis using zero-shot Legal-BERT.
          </p>

          {error && (
            <div className="w-full mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="w-full bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign in with Google Account</span>
            </div>

            <div className="w-full flex justify-center py-2">
              {loading ? (
                <div className="text-xs text-slate-400 font-medium animate-pulse">Authenticating with Google...</div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  text="signin_with"
                  width="280"
                />
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Secure single sign-on powered by Google OAuth 2.0. No password required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
