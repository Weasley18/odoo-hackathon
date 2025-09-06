import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth } from '../services/api';

// Types
type User = {
  id: number;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: { username?: string }) => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (token exists in localStorage)
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const userData = await auth.getProfile();
          setUser(userData);
        } catch (err) {
          // If token is invalid, clear it
          localStorage.removeItem('auth_token');
          console.error('Error fetching user profile:', err);
        }
      }
      
      setIsLoading(false);
    };
    
    fetchUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const data = await auth.login(email, password);
      localStorage.setItem('auth_token', data.access_token);
      
      // Fetch user profile after successful login
      const userData = await auth.getProfile();
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username?: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await auth.signup(email, password, username);
      // After signup, login automatically
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  // Update profile function
  const updateProfile = async (userData: { username?: string }) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const updatedUser = await auth.updateProfile(userData);
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
