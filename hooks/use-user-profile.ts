// Custom hook for managing user profile data
import { useState, useEffect } from 'react'
import { UserProfile, Prompt } from '@/types'
import { userService } from '@/services/user-service'

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const [profileData, promptsData] = await Promise.all([
        userService.getUserProfile(userId),
        userService.getUserPrompts(userId),
      ])

      setProfile(profileData)
      setPrompts(promptsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  return {
    profile,
    prompts,
    loading,
    error,
    refreshProfile: fetchProfile,
    setProfile,
  }
}
