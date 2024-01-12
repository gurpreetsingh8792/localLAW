import React, { createContext, useState, useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutTimer, setLogoutTimer] = useState(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const sessionFlag = sessionStorage.getItem('isSessionActive');

    // Check if the token and session flag exist
    if (token && sessionFlag) {
      setIsLoggedIn(true);
      setAutomaticLogout();
    } else if (token && !sessionFlag) {
      logout(); // Logout if no session flag is found
    }

    // Set or reset the session flag
    sessionStorage.setItem('isSessionActive', 'true');

    // Cleanup
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [logoutTimer]);

  const setAutomaticLogout = () => {
    // Clear any existing timers
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }

    // Set a new timer
    const timer = setTimeout(() => {
      logout(true);
    }, 3 * 3600000); // 3 hours in milliseconds 3 * 3600000

    setLogoutTimer(timer);
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    sessionStorage.setItem('isSessionActive', 'true');
    setIsLoggedIn(true);
    setAutomaticLogout();
  };

  const logout = (showAlert = false) => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('isSessionActive');
    setIsLoggedIn(false);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
    if (showAlert) {
      window.alert('Your Session has Expired. Please Log In again');
    }
    // navigate('/login');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

