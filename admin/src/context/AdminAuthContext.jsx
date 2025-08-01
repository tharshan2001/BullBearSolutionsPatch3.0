// src/context/AdminAuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/adminApi';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await API.get('/api/admin/verify-token');
        setAdmin(data.data);
      } catch (err) {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/api/admin/login', { email, password });
    setAdmin(data.data);
    return data;
  };

  const logout = async () => {
    await API.post('/api/admin/logout');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout, loading }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};
