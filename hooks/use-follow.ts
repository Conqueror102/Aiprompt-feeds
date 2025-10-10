// Custom hook for managing follow/unfollow operations
import { useState } from 'react'
import { userService } from '@/services/user-service'
import { toast } from '@/hooks/use-toast'
import { useBadgeChecker } from '@/hooks/use-badges'

export function useFollow() {
  const [loading, setLoading] = useState(false)
  const { checkAfterFollow } = useBadgeChecker()

  const toggleFollow = async (
    userId: string,
    isFollowing: boolean,
    onSuccess?: () => void
  ): Promise<boolean> => {
    setLoading(true)
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId)
        toast({
          title: 'Unfollowed',
          description: 'You have unfollowed this user',
        })
      } else {
        await userService.followUser(userId)
        toast({
          title: 'Following',
          description: 'You are now following this user',
        })
      }
      checkAfterFollow()
      onSuccess?.()
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update follow status',
        variant: 'destructive',
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleFollow,
    loading,
  }
}
