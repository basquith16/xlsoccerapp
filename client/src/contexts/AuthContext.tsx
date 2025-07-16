import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';
import { User, RegisterFormData, UpdateProfileFormData } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData: RegisterFormData) => {
    console.log('AuthContext: Starting registration with data:', userData);
    try {
      const response = await authService.register(userData);
      console.log('AuthContext: Registration response:', response);
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return { success: true, data: response };
    } catch (error: any) {
      console.error('AuthContext: Registration error caught:', error);
      console.error('AuthContext: Error response data:', error.response?.data);
      console.error('AuthContext: Error message:', error.response?.data?.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      return { success: true };
    }
  };

  const updateProfile = async (userData: UpdateProfileFormData) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.data) {
        setUser(response.data);
      }
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reset email' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 