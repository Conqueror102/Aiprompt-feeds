// Service for prompt-related API operations
import { apiClient } from './api-client'
import { Prompt, PromptsResponse } from '@/types'

export const promptService = {
  async getAll(page = 1, limit = 12, category?: string, agent?: string): Promise<PromptsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (category && category !== 'all') params.append('category', category)
    if (agent && agent !== 'all') params.append('agent', agent)
    
    return apiClient.get<PromptsResponse>(`/prompts?${params.toString()}`)
  },

  async getById(id: string): Promise<Prompt> {
    return apiClient.get<Prompt>(`/prompts/${id}`)
  },

  async create(promptData: Partial<Prompt>): Promise<Prompt> {
    return apiClient.post<Prompt>('/prompts/create', promptData)
  },

  async update(id: string, promptData: Partial<Prompt>): Promise<Prompt> {
    return apiClient.put<Prompt>(`/prompts/${id}`, promptData)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/prompts/${id}`)
  },

  async like(promptId: string): Promise<void> {
    return apiClient.post('/user/like-prompt', { promptId })
  },

  async save(promptId: string): Promise<void> {
    return apiClient.post('/user/save-prompt', { promptId })
  },

  async rate(promptId: string, value: number): Promise<{ average: number, count: number }> {
    return apiClient.post<{ average: number, count: number }>(`/prompts/${promptId}/rate`, { value })
  },

  async getUserRating(promptId: string): Promise<{ value: number | null }> {
    return apiClient.get<{ value: number | null }>(`/prompts/${promptId}/rate`)
  },

  async getLikedPrompts(): Promise<Prompt[]> {
    const response = await apiClient.get<PromptsResponse>('/user/liked-prompts')
    return response.prompts
  },

  async getSavedPrompts(): Promise<Prompt[]> {
    const response = await apiClient.get<PromptsResponse>('/user/saved-prompts')
    return response.prompts
  },

  async getUserPrompts(): Promise<Prompt[]> {
    const response = await apiClient.get<PromptsResponse>('/user/prompts')
    return response.prompts
  },
}
