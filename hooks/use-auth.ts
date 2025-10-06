import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { isTokenExpiringSoon } from '@/lib/auth'
import { authService } from '@/services/auth-service'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error: any) {
      console.error("Failed to fetch user:", error)
      
      // Only logout if it's an authentication error (401)
      if (error?.message?.includes("401") || error?.message?.includes("Unauthorized") || error?.message?.includes("Invalid token")) {
        localStorage.removeItem("token")
        setUser(null)
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        })
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    toast({
      title: "Logged Out",
      description: "You have been logged out. Please sign in again.",
      variant: "destructive",
    })
    router.push("/login")
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password)
      localStorage.setItem("token", data.token)
      setUser(data.user)
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

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authService.register(name, email, password)
      localStorage.setItem("token", data.token)
      setUser(data.user)
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully",
      })
      router.push("/")
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

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth,
  }
} 