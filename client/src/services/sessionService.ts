import api from './api';
import { Session, ApiResponse } from '../types';

export const sessionService = {
  // Get all sessions
  async getAllSessions(): Promise<ApiResponse<Session[]>> {
    const response = await api.get<ApiResponse<Session[]>>('/api/v1/sessions');
    return response.data;
  },

  // Get single session by slug
  async getSession(slug: string): Promise<ApiResponse<Session>> {
    const response = await api.get<ApiResponse<Session>>(`/api/v1/sessions/slug/${slug}`);
    return response.data;
  },

  // Create new session (admin only)
  async createSession(sessionData: FormData): Promise<ApiResponse<Session>> {
    const response = await api.post<ApiResponse<Session>>('/api/v1/sessions', sessionData);
    return response.data;
  },

  // Update session (admin only)
  async updateSession(id: string, sessionData: FormData): Promise<ApiResponse<Session>> {
    const response = await api.patch<ApiResponse<Session>>(`/api/v1/sessions/${id}`, sessionData);
    return response.data;
  },

  // Delete session (admin only)
  async deleteSession(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/api/v1/sessions/${id}`);
    return response.data;
  },

  // Book a session
  async bookSession(sessionId: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(`/api/v1/booking/checkout-session/${sessionId}`);
    return response.data;
  },

  // Get user's booked sessions
  async getMySessions(): Promise<ApiResponse<Session[]>> {
    const response = await api.get<ApiResponse<Session[]>>('/myaccount/sessions');
    return response.data;
  },
}; 