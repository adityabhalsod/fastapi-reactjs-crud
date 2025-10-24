import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthContextType,
  User,
  SignupData,
  ForgotPasswordResponse,
  ResetPasswordData
} from '../types';
import { authApi, ApiError } from '../utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('access_token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login({ username, password });
      
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('access_token', response.access_token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.detail);
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    try {
      const newUser = await authApi.signup(data);
      
      // After successful signup, automatically log in
      await login(data.username, data.password);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.detail);
      }
      throw new Error('Signup failed. Please try again.');
    }
  };

  const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      return await authApi.forgotPassword({ email });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.detail);
      }
      throw new Error('Failed to send reset token. Please try again.');
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<void> => {
    try {
      await authApi.resetPassword(data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.detail);
      }
      throw new Error('Failed to reset password. Please try again.');
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};