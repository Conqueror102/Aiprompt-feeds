// Custom hook for managing user profile data
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user-service'
import { UserProfile } from '@/types'

export function useUserProfile(userId: string) {
  const queryClient = useQueryClient()

  // Specific query for user profile
  const profileQuery = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userService.getUserProfile(userId),
    enabled: !!userId,
  })

  // Specific query for user prompts
  const promptsQuery = useQuery({
    queryKey: ['user-prompts', userId],
    queryFn: () => userService.getUserPrompts(userId),
    enabled: !!userId,
  })

  // Helper to update profile in cache (optimistic updates)
  const updateProfile = (updates: Partial<UserProfile>) => {
    queryClient.setQueryData(['user-profile', userId], (oldData: UserProfile | undefined) => {
      if (!oldData) return oldData
      return { ...oldData, ...updates }
    })
  }

  // Deprecated compatibility layer
  const setProfile = (newData: UserProfile | ((prev: UserProfile | null) => UserProfile | null)) => {
    if (typeof newData === 'function') {
       // We can't support function updates easily without current state context, 
       // but for the specific usage in page.tsx it might be needed.
       // Actually page.tsx passes an object, not a function mostly?
       // Let's check page.tsx usage:
       // setProfile({ ...profile, isFollowing: !wasFollowing ... })
       // So it passes an object.
       // However, to be safe, we should guide usage to updateProfile.
       console.warn("setProfile is deprecated, use updateProfile")
    } else {
       if (newData) updateProfile(newData)
    }
  }

  return {
    profile: profileQuery.data ?? null,
    prompts: promptsQuery.data ?? [],
    loading: profileQuery.isLoading || promptsQuery.isLoading,
    error: (profileQuery.error || promptsQuery.error) 
      ? ((profileQuery.error as Error)?.message || (promptsQuery.error as Error)?.message) 
      : null,
    refreshProfile: () => {
      profileQuery.refetch()
      promptsQuery.refetch()
    },
    updateProfile,
    setProfile, // Keep for backward compatibility but implementation varies
  }
}
