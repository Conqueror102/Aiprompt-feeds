import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { authService } from '@/services/auth-service'
import { User } from '@/types'

export function useAuth() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
      if (!token) return null
      
      try {
        const userData = await authService.getCurrentUser()
        // Keep keeping local copy for initialData on refresh
        localStorage.setItem('cachedUser', JSON.stringify(userData))
        return userData
      } catch (error: any) {
        // Handle 401s specifically
        if (error?.message?.includes("401") || error?.message?.includes("Unauthorized")) {
          localStorage.removeItem("token")
          localStorage.removeItem('cachedUser')
          return null
        }
        throw error
      }
    },
    // Use cached user from localStorage as initial data to prevent flash
    initialData: () => {
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem('cachedUser')
        return cachedUser ? JSON.parse(cachedUser) : undefined
      }
      return undefined
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // User data is relatively static
  })

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem('cachedUser')
    queryClient.setQueryData(['user'], null)
    
    toast({
      title: "Logged Out",
      description: "You have been logged out. Please sign in again.",
      variant: "destructive",
    })
    router.push("/login")
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password)
      localStorage.setItem("token", data.token)
      localStorage.setItem('cachedUser', JSON.stringify(data.user))
      
      // Update query cache immediately
      queryClient.setQueryData(['user'], data.user)
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully",
      })
      router.push("/")
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign in"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authService.register(name, email, password)
      localStorage.setItem("token", data.token)
      localStorage.setItem('cachedUser', JSON.stringify(data.user))
      
      // Update query cache immediately
      queryClient.setQueryData(['user'], data.user)
      
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully",
      })
      
      const redirect = searchParams.get('redirect') || "/"
      router.push(redirect)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create account"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      return { success: false, error: message }
    }
  }

  return {
    user: user ?? null, // Ensure explicit null if undefined
    loading: isLoading,
    login,
    logout,
    register,
    checkAuth: refetch, // Alias refetch to checkAuth for compatibility
  }
} 