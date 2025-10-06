// Core type definitions for the application

export interface User {
  id: string
  name: string
  email: string
  role?: string
  bio?: string
  avatar?: string
  followers?: number
  following?: number
  createdAt?: string
}

export interface UserProfile extends User {
  promptsCount: number
  likesCount: number
  isFollowing?: boolean
}

export interface Prompt {
  _id: string
  title: string
  content: string
  description?: string
  aiAgents: string[]
  category: string
  createdBy: {
    _id: string
    name: string
  }
  likes: number
  saves: number
  rating?: number
  private?: boolean
  tools?: string[]
  technologies?: string[]
  createdAt: string
}

export interface PromptFilters {
  searchTerm?: string
  category?: string
  agent?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface PromptsResponse {
  prompts: Prompt[]
}
