import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchMe = async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setUser(data.user);
      addToast('Account created successfully!', 'success');
      return data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const sendOtp = async (phone) => {
    try {
      const data = await apiFetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      if (data.devOtp) {
        addToast(`[DEV MODE OTP]: ${data.devOtp}`, 'info', 10000);
      } else {
        addToast('OTP sent to phone number!', 'success');
      }
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const verifyOtp = async (phone, otp, name) => {
    try {
      const data = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, name }),
      });
      setUser(data.user);
      addToast('Mobile verification successful!', 'success');
      return data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore logout errors
    } finally {
      setUser(null);
      addToast('Logged out successfully', 'info');
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        updateUserProfile,
        refreshUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
