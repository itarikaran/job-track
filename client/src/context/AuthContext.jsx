import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authService.getMe();
        setUser(response.user || null);
      } catch (err) {
        // No valid session
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    // Listen for 401 unauthorized events from API interceptor
    const handleUnauthorized = () => {
      setUser(null);
      navigate("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [navigate]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user || null);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.user || null);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors, still clear local state
    }
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};