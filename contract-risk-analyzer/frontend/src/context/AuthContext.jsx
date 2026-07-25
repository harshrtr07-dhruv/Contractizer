import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(false);

  const onboard = async (name, age) => {
    setLoading(true);
    try {
      const response = await api.put('/auth/onboard', { name, age: parseInt(age, 10) });
      return handleAuthResponse(response.data.access_token);
    } catch (error) {
      console.error('Onboard error details:', error);
      const detailMsg = error.response?.data?.detail || 'Onboarding failed.';
      return { success: false, error: detailMsg };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google', { id_token: idToken });
      return handleAuthResponse(response.data.access_token);
    } catch (error) {
      console.error('Google login error details:', error);
      const detailMsg = error.response?.data?.detail 
        || (error.message === 'Network Error' ? 'Cannot connect to backend server. Make sure uvicorn is running on http://localhost:8000' : error.message)
        || 'Google Authentication failed.';
      return {
        success: false,
        error: detailMsg
      };
    } finally {
      setLoading(false);
    }
  };

  const handleAuthResponse = (access_token) => {
    setToken(access_token);
    localStorage.setItem('token', access_token);

    // Parse payload from JWT token
    let userData = { email: 'User' };
    try {
      const payloadBase64 = access_token.split('.')[1];
      userData = JSON.parse(atob(payloadBase64));
    } catch (e) {
      console.warn('Failed to parse JWT payload:', e);
    }

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, onboard, googleLogin, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
