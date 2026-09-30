import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, googleAuthUser, getMyProfile } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: '66f000000000000000000001',
    name: 'Kasun Perera',
    email: 'kasun@gmail.com',
    role: 'customer',
    address: 'No 42, New Kandy Road, Malabe',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
  });
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('fixora_token');
      const storedUser = await AsyncStorage.getItem('fixora_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await loginUser(email, password);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        await AsyncStorage.setItem('fixora_token', res.token);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        await AsyncStorage.setItem('fixora_token', res.token);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const googleLogin = async (role = 'customer') => {
    try {
      const googleData = {
        email: 'kasun.google@gmail.com',
        name: 'Kasun Perera',
        googleId: 'g_user_883192',
        role,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
      };
      const res = await googleAuthUser(googleData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        await AsyncStorage.setItem('fixora_token', res.token);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('fixora_token');
    await AsyncStorage.removeItem('fixora_user');
  };

  const switchRole = (newRole) => {
    setUser((prev) => ({
      ...prev,
      role: newRole,
      name:
        newRole === 'provider'
          ? 'Sunil Perera'
          : newRole === 'admin'
          ? 'Admin Coordinator'
          : 'Kasun Perera',
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleLogin,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
