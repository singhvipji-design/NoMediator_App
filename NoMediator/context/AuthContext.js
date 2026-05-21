import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();
const API_URL = Platform.OS === 'web' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed.');
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(AUTH_USER_KEY);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verify token is still valid by calling /me endpoint
          try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
              method: 'GET',
              headers: { 
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json'
              },
            });

            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
              await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
            } else {
              // Token expired or invalid
              await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
              await AsyncStorage.removeItem(AUTH_USER_KEY);
              setToken(null);
              setUser(null);
            }
          } catch (error) {
            console.warn('Token validation failed:', error.message);
            // Keep local session if network fails
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      
      // Save token and user to AsyncStorage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      Alert.alert('Login Error', error.message);
      return false;
    }
  };

  const register = async (name, email, phone, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await handleResponse(response);
      
      // Save token and user to AsyncStorage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      Alert.alert('Registration Error', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error('Logout storage error:', error);
    }
    setToken(null);
    setUser(null);
  };

  // Don't show anything while initializing
  if (isInitializing) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
