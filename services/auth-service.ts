// Service for authentication operations
import { apiClient } from './api-client'
import { User, AuthResponse } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password })
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', { name, email, password })
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/user/update-profile', userData)
  },
}
