import api from './api';
import { User, RegisterFormData, UpdateProfileFormData, UpdatePasswordFormData, AuthResponse, ApiResponse } from '../types';

export const authService = {
  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/users/login', {
      email,
      password,
    });
    
    if (response.data.status === 'success') {
      sessionStorage.setItem('token', response.data.token!);
      sessionStorage.setItem('user', JSON.stringify(response.data.data!.user));
    }
    
    return response.data;
  },

  // Register user
  async register(userData: RegisterFormData): Promise<AuthResponse> {
    console.log('AuthService: Attempting to register with data:', userData);
    console.log('AuthService: API base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
    
    try {
      const response = await api.post<AuthResponse>('/api/v1/users/signup', userData);
      console.log('AuthService: Registration successful:', response.data);
      
      if (response.data.status === 'success') {
        sessionStorage.setItem('token', response.data.token!);
        sessionStorage.setItem('user', JSON.stringify(response.data.data!.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('AuthService: Registration error:', error);
      console.error('AuthService: Error response:', error.response?.data);
      console.error('AuthService: Error status:', error.response?.status);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.get('/api/v1/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  },

  // Update user profile
  async updateProfile(userData: UpdateProfileFormData): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>('/api/v1/users/updateMyAccount', userData);
    return response.data;
  },

  // Update password
  async updatePassword(passwordData: UpdatePasswordFormData): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>('/api/v1/users/updateMyPassword', passwordData);
    return response.data;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/api/v1/users/forgotPassword', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await api.patch<ApiResponse>(`/api/v1/users/resetPassword/${token}`, {
      password,
      passwordConfirm: password,
    });
    return response.data;
  },
}; 