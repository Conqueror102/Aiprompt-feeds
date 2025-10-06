// Service for user-related operations
import { apiClient } from './api-client'
import { UserProfile, Prompt } from '@/types'

export const userService = {
  async getUserProfile(userId: string): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`/user/profile/${userId}`)
  },

  async getUserPrompts(userId: string): Promise<Prompt[]> {
    const response = await apiClient.get<{ prompts: Prompt[] }>(`/user/${userId}/prompts`)
    return response.prompts
  },

  async followUser(userId: string): Promise<void> {
    return apiClient.post('/user/follow', { userId })
  },

  async unfollowUser(userId: string): Promise<void> {
    return apiClient.post('/user/unfollow', { userId })
  },

  async getFollowers(userId: string): Promise<UserProfile[]> {
    const response = await apiClient.get<{ users: UserProfile[] }>(`/user/${userId}/followers`)
    return response.users
  },

  async getFollowing(userId: string): Promise<UserProfile[]> {
    const response = await apiClient.get<{ users: UserProfile[] }>(`/user/${userId}/following`)
    return response.users
  },
}
