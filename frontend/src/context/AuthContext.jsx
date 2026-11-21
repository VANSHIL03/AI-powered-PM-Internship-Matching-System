import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@manthan.gov.in',
    password: 'Admin@123',
    role: 'admin',
    name: 'Dr. Rajeshwar Rao (National Allocation Director)',
  },
  student: {
    email: 'arjun.sharma@example.com',
    password: 'Student@123',
    role: 'student',
    name: 'Arjun Sharma (B.Tech CS, CGPA: 8.85)',
  },
  company: {
    email: 'hr@tcs.example.com',
    password: 'Company@123',
    role: 'company',
    name: 'Tata Consultancy Services (HR Lead)',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pmis_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
    } catch (err) {
      console.warn('Could not fetch current user:', err.message);
      localStorage.removeItem('pmis_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const accessToken = res.data.access_token;
      localStorage.setItem('pmis_token', accessToken);
      setToken(accessToken);
      setUser(res.data.user);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      const accessToken = res.data.access_token;
      localStorage.setItem('pmis_token', accessToken);
      setToken(accessToken);
      setUser(res.data.user);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pmis_token');
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role) => {
    const account = DEMO_ACCOUNTS[role];
    if (!account) return;
    return await login(account.email, account.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        demoLogin,
        refreshUser: fetchCurrentUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isCompany: user?.role === 'company',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
