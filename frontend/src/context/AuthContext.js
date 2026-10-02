import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('fixora_token');
      const storedUser = await AsyncStorage.getItem('fixora_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('Error loading auth from storage', e);
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

      // Check locally registered accounts in AsyncStorage
      const regAccountsStr = await AsyncStorage.getItem('fixora_registered_accounts');
      const regAccounts = regAccountsStr ? JSON.parse(regAccountsStr) : [];
      const matchedAccount = regAccounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase().trim()
      );

      // If backend network error or offline fallback, construct authenticated user
      if (
        matchedAccount ||
        !res.success &&
        (res.message?.includes('failed') ||
          res.message?.includes('Network') ||
          res.message?.includes('aborted') ||
          res.message?.includes('ConnectException'))
      ) {
        const isAdmin = email.toLowerCase().includes('admin');
        const isSunil = email.toLowerCase().includes('sunil');
        const isRamesh = email.toLowerCase().includes('ramesh');
        const isProvider =
          matchedAccount?.role === 'provider' ||
          email.toLowerCase().includes('provider') ||
          isSunil ||
          isRamesh;

        let resolvedName = '';
        let resolvedRole = 'customer';
        let resolvedCategory = 'Customer';
        let resolvedAddress = 'Colombo, Sri Lanka';
        let resolvedAvatar = null;

        if (matchedAccount) {
          resolvedName = matchedAccount.name;
          resolvedRole = matchedAccount.role || 'customer';
          resolvedCategory = matchedAccount.category || 'Specialist';
          resolvedAddress = matchedAccount.city
            ? `${matchedAccount.city}, Sri Lanka`
            : matchedAccount.businessAddress || 'Colombo, Sri Lanka';
          resolvedAvatar = matchedAccount.avatar || null;
        } else if (isAdmin) {
          resolvedName = 'M. Shibly (Admin Coordinator)';
          resolvedRole = 'admin';
          resolvedAddress = 'Headquarters, Colombo 03';
          resolvedAvatar = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200';
        } else if (isSunil) {
          resolvedName = 'Sunil Perera';
          resolvedRole = 'provider';
          resolvedCategory = 'Plumber';
          resolvedAddress = 'Gothatuwa, Colombo';
          resolvedAvatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200';
        } else if (isRamesh) {
          resolvedName = 'Ramesh Mendis';
          resolvedRole = 'provider';
          resolvedCategory = 'Electrician';
          resolvedAddress = 'Colombo 05, Sri Lanka';
          resolvedAvatar = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200';
        } else if (isProvider) {
          const emailPrefix = email.split('@')[0];
          resolvedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          resolvedRole = 'provider';
          resolvedCategory = 'Service Specialist';
          resolvedAddress = 'Colombo, Sri Lanka';
          resolvedAvatar = null;
        } else {
          const emailPrefix = email.split('@')[0];
          resolvedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          resolvedAvatar = null;
        }

        const demoUser = {
          id: matchedAccount?._id || 'user_' + Date.now(),
          name: resolvedName,
          email: email.trim().toLowerCase(),
          role: resolvedRole,
          category: resolvedCategory,
          address: resolvedAddress,
          avatar: resolvedAvatar,
          phone: matchedAccount?.phone || '+94 77 123 4567',
        };

        const demoToken = 'fixora_jwt_' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        await AsyncStorage.setItem('fixora_token', demoToken);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(demoUser));
        return { success: true, isDemo: true };
      }

      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Save locally to registered accounts storage
      try {
        const regAccountsStr = await AsyncStorage.getItem('fixora_registered_accounts');
        const regAccounts = regAccountsStr ? JSON.parse(regAccountsStr) : [];
        regAccounts.push(userData);
        await AsyncStorage.setItem('fixora_registered_accounts', JSON.stringify(regAccounts));
      } catch (err) {
        console.log('Error saving registered account locally', err);
      }

      const res = await registerUser(userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        await AsyncStorage.setItem('fixora_token', res.token);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }

      // If backend network error, create local authenticated account
      if (
        !res.success &&
        (res.message?.includes('failed') ||
          res.message?.includes('Network') ||
          res.message?.includes('aborted') ||
          res.message?.includes('ConnectException'))
      ) {
        const demoUser = {
          id: 'demo_' + Date.now(),
          name: userData.name || 'New Member',
          email: userData.email,
          phone: userData.phone || '+94 77 123 4567',
          role: userData.role || 'customer',
          category: userData.category || (userData.role === 'provider' ? 'Electrician' : undefined),
          address: userData.city ? `${userData.city}, Sri Lanka` : 'Colombo, Sri Lanka',
          avatar: null, // Allow user to add their own photo
        };
        const demoToken = 'demo_jwt_token_' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        await AsyncStorage.setItem('fixora_token', demoToken);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(demoUser));
        return { success: true, isDemo: true, user: demoUser };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateUser = async (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      AsyncStorage.setItem('fixora_user', JSON.stringify(updated));
      return updated;
    });
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
          ? 'M. Shibly (Admin Coordinator)'
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
        updateUser,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
