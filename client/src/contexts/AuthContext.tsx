import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useMe, useLogin, useSignup, useForgotPassword } from '../services/graphqlService';
import { handleMutationResponse, handleGraphQLError } from '../services/graphqlService';
import { User, RegisterFormData, UpdateProfileFormData } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // GraphQL hooks
  const { data: meData, loading: meLoading, error: meError, refetch: refetchMe } = useMe();
  const [loginMutation] = useLogin();
  const [signupMutation] = useSignup();
  const [forgotPasswordMutation] = useForgotPassword();

  // Handle me query results
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (meLoading) {
      // Still loading, keep current state
      return;
    }

    if (meError) {
      // Query failed, token might be invalid
      console.log('Me query failed, clearing token:', meError);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }

    if (meData?.me) {
      // Successfully got user data
      setUser(meData.me);
      setLoading(false);
    }
  }, [meData, meLoading, meError]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } }
      });
      
      console.log('Login response:', data);
      const response = handleMutationResponse(data.login);
      console.log('Handled response:', response);
      
      if (response.success && response.data) {
        // Store token
        console.log('Storing token:', data.login.token);
        localStorage.setItem('token', data.login.token);
        setUser(response.data);
        
        // Refetch user data to ensure consistency
        await refetchMe();
      }
      
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: handleGraphQLError(error)
      };
    }
  };

  const register = async (userData: RegisterFormData) => {
    console.log('AuthContext: Starting registration with data:', userData);
    try {
      const { data } = await signupMutation({
        variables: { input: userData }
      });
      
      console.log('AuthContext: Raw signup response:', data);
      const response = handleMutationResponse(data.signup);
      console.log('AuthContext: Handled response:', response);
      
      if (response.success && response.data) {
        // Store token
        localStorage.setItem('token', data.signup.token);
        setUser(response.data);
        
        // Refetch user data to ensure consistency
        await refetchMe();
      }
      
      return response;
    } catch (error: any) {
      console.error('AuthContext: Registration error caught:', error);
      return { 
        success: false, 
        error: handleGraphQLError(error)
      };
    }
  };

  const logout = async () => {
    try {
      // Clear token and user state
      localStorage.removeItem('token');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      localStorage.removeItem('token');
      setUser(null);
      return { success: true };
    }
  };

  const updateProfile = async (userData: UpdateProfileFormData) => {
    try {
      // For now, we'll need to implement this mutation in the backend
      // This is a placeholder for the profile update functionality
      console.log('Profile update not yet implemented in GraphQL');
      return { 
        success: false, 
        error: 'Profile update not yet implemented' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: handleGraphQLError(error)
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { data } = await forgotPasswordMutation({
        variables: { email }
      });
      
      return handleMutationResponse(data.forgotPassword);
    } catch (error: any) {
      return { 
        success: false, 
        error: handleGraphQLError(error)
      };
    }
  };

  const value = {
    user,
    loading: loading || meLoading,
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