import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/api/auth/profile");
      const userData = res.data;
      setUser(userData);

      const isPremium = Boolean(userData?.premium?.active);
      setPremiumBlocked(!isPremium);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
      setPremiumBlocked(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Interceptor to catch 401 and reload
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const config = error.config || {};
        if (error.response?.status === 401 && !config.__skipAuthInterceptor) {
          setUser(null);
          setPremiumBlocked(false);
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  // Periodic session check every 1 hour
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await axiosInstance.get("/api/auth/profile");
        // Session valid, do nothing
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null);
          setPremiumBlocked(false);
          window.location.reload();
        }
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    await axiosInstance.post(
      "/api/auth/login",
      { email, password },
      {
        __skipAuthInterceptor: true, 
      }
    );
    await fetchProfile();
  };

  const logout = async () => {
    await axiosInstance.post("/api/auth/logout");
    setUser(null);
    setPremiumBlocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        premiumBlocked,
        axiosInstance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
