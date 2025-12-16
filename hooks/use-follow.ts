// Custom hook for managing follow/unfollow operations
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user-service'
import { toast } from '@/hooks/use-toast'
import { useBadgeChecker } from '@/hooks/use-badges'
import { UserProfile } from '@/types'

export function useFollow() {
  const queryClient = useQueryClient()
  const { checkAfterFollow } = useBadgeChecker()

  const followMutation = useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string, isFollowing: boolean }) => {
      if (isFollowing) {
        await userService.unfollowUser(userId)
        return { isFollowing: false }
      } else {
        await userService.followUser(userId)
        return { isFollowing: true }
      }
    },
    onMutate: async ({ userId, isFollowing }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['user-profile', userId] })
      const previousProfile = queryClient.getQueryData<UserProfile>(['user-profile', userId])

      queryClient.setQueryData<UserProfile>(['user-profile', userId], (old) => {
        if (!old) return old
        return {
          ...old,
          isFollowing: !isFollowing,
          followers: (old.followers || 0) + (isFollowing ? -1 : 1)
        }
      })

      return { previousProfile }
    },
    onError: (err, { userId }, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['user-profile', userId], context.previousProfile)
      }
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update follow status',
        variant: 'destructive',
      })
    },
    onSuccess: (data) => {
      toast({
        title: data.isFollowing ? 'Following' : 'Unfollowed',
        description: data.isFollowing ? 'You are now following this user' : 'You have unfollowed this user',
      })
      checkAfterFollow()
    }
  })

  return {
    toggleFollow: async (userId: string, isFollowing: boolean, onSuccess?: () => void) => {
        await followMutation.mutateAsync({ userId, isFollowing })
        onSuccess?.()
        return true
    },
    loading: followMutation.isPending,
  }
}

export function useFollowers(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const response = await fetch(`/api/user/${userId}/followers`)
      if (!response.ok) throw new Error('Failed to fetch followers')
      return response.json()
    },
    enabled: !!userId && enabled
  })
}

export function useFollowing(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const response = await fetch(`/api/user/${userId}/following`)
      if (!response.ok) throw new Error('Failed to fetch following')
      return response.json()
    },
    enabled: !!userId && enabled
  })
}
