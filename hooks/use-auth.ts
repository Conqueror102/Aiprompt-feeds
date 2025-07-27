import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { isTokenExpiringSoon } from '@/lib/auth'

interface User {
  id: string
  name: string
  email: string
  role?: string
}

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

    // Check if token is expiring soon
    if (isTokenExpiringSoon(token)) {
      toast({
        title: "Session Expiring",
        description: "Your session will expire soon. Please log in again.",
        variant: "destructive",
      })
      logout()
      return
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, logout
        logout()
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      logout()
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        setUser(data.user)
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully",
        })
        router.push("/")
        return { success: true }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to sign in",
          variant: "destructive",
        })
        return { success: false, error: data.message }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        setUser(data.user)
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully",
        })
        router.push("/")
        return { success: true }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create account",
          variant: "destructive",
        })
        return { success: false, error: data.message }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      })
      return { success: false, error: "Network error" }
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