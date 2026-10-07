import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, updateUserProfile, getMyProfile } from '../services/api';

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
      const trimmedEmail = email ? email.trim().toLowerCase() : '';
      const trimmedPass = password || '';

      const res = await loginUser(trimmedEmail, trimmedPass);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        await AsyncStorage.setItem('fixora_token', res.token);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }

      // If backend responded with a credential or validation error (e.g. 401 Invalid email or password),
      // strictly return the failure and NEVER bypass it with demo fallback!
      const isNetworkFail =
        Boolean(res.isNetworkError) ||
        (res.message &&
          (res.message.includes('Network request failed') ||
            res.message.includes('aborted') ||
            res.message.includes('Failed to fetch') ||
            res.message.includes('ConnectException')));

      if (!isNetworkFail) {
        return { success: false, message: res.message || 'Invalid email or password' };
      }

      // Offline / Network Failure Fallback ONLY when the server cannot be reached
      const regAccountsStr = await AsyncStorage.getItem('fixora_registered_accounts');
      const regAccounts = regAccountsStr ? JSON.parse(regAccountsStr) : [];
      const matchedAccount = regAccounts.find(
        (a) => a.email && a.email.toLowerCase() === trimmedEmail
      );

      // If registered account exists locally, verify password before allowing offline access
      if (matchedAccount) {
        if (matchedAccount.password && matchedAccount.password !== trimmedPass) {
          return { success: false, message: 'Invalid email or password' };
        }

        const demoUser = {
          id: matchedAccount._id || 'user_' + Date.now(),
          name: matchedAccount.name,
          email: matchedAccount.email.toLowerCase(),
          role: matchedAccount.role || 'customer',
          category: matchedAccount.category || 'Specialist',
          address: matchedAccount.city
            ? `${matchedAccount.city}, Sri Lanka`
            : matchedAccount.businessAddress || 'Colombo, Sri Lanka',
          avatar: matchedAccount.avatar || null,
          phone: matchedAccount.phone || '+94 77 123 4567',
        };

        const demoToken = 'fixora_jwt_' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        await AsyncStorage.setItem('fixora_token', demoToken);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(demoUser));
        return { success: true, isDemo: true, user: demoUser };
      }

      // Offline fallback for predefined seed accounts strictly requiring default password
      const isDemoEmail =
        trimmedEmail.includes('admin') ||
        trimmedEmail.includes('sunil') ||
        trimmedEmail.includes('ramesh') ||
        trimmedEmail === 'kasun@gmail.com';

      if (isDemoEmail) {
        if (trimmedPass !== 'password123') {
          return { success: false, message: 'Invalid email or password' };
        }

        const isAdmin = trimmedEmail.includes('admin');
        const isSunil = trimmedEmail.includes('sunil');
        const isRamesh = trimmedEmail.includes('ramesh');
        const isProvider = isSunil || isRamesh;

        let resolvedName = 'Kasun Perera';
        let resolvedRole = 'customer';
        let resolvedCategory = 'Customer';
        let resolvedAddress = 'Colombo, Sri Lanka';
        let resolvedAvatar = null;

        if (isAdmin) {
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
          const emailPrefix = trimmedEmail.split('@')[0];
          resolvedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          resolvedRole = 'provider';
          resolvedCategory = 'Service Specialist';
        }

        const demoUser = {
          id: 'user_' + Date.now(),
          name: resolvedName,
          email: trimmedEmail,
          role: resolvedRole,
          category: resolvedCategory,
          address: resolvedAddress,
          avatar: resolvedAvatar,
          phone: '+94 77 123 4567',
        };

        const demoToken = 'fixora_jwt_' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        await AsyncStorage.setItem('fixora_token', demoToken);
        await AsyncStorage.setItem('fixora_user', JSON.stringify(demoUser));
        return { success: true, isDemo: true, user: demoUser };
      }

      return {
        success: false,
        message: 'Could not connect to Fixora service. Please check your internet connection.',
      };
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

      return {
        success: false,
        message:
          res.message ||
          'Could not connect to Fixora service. Please verify your internet connection.',
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateUser = async (updatedFields) => {
    let updatedUserObj = null;
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      updatedUserObj = updated;
      AsyncStorage.setItem('fixora_user', JSON.stringify(updated));
      return updated;
    });

    try {
      const regAccountsStr = await AsyncStorage.getItem('fixora_registered_accounts');
      if (regAccountsStr && updatedUserObj?.email) {
        const regAccounts = JSON.parse(regAccountsStr);
        const idx = regAccounts.findIndex((a) => a.email.toLowerCase() === updatedUserObj.email.toLowerCase());
        if (idx !== -1) {
          regAccounts[idx] = { ...regAccounts[idx], ...updatedFields };
          await AsyncStorage.setItem('fixora_registered_accounts', JSON.stringify(regAccounts));
        }
      }
    } catch (err) {
      console.log('Error syncing local registered accounts:', err.message);
    }

    try {
      const res = await updateUserProfile(updatedFields);
      if (res && res.success && res.user) {
        setUser((prev) => {
          const merged = { ...prev, ...res.user };
          AsyncStorage.setItem('fixora_user', JSON.stringify(merged));
          return merged;
        });
        return { success: true, user: res.user };
      }
      return res || { success: true };
    } catch (err) {
      console.log('Online profile sync skipped:', err.message);
      return { success: true, offline: true };
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await getMyProfile();
      if (res && res.success && res.user) {
        setUser((prev) => {
          const merged = { ...prev, ...res.user };
          AsyncStorage.setItem('fixora_user', JSON.stringify(merged));
          return merged;
        });
        return { success: true, user: res.user };
      }
      return res;
    } catch (err) {
      console.log('Error refreshing profile:', err.message);
      return { success: false, message: err.message };
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
        refreshProfile,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
