"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, Calendar, Heart, FileText, Users, UserPlus, UserMinus, UserCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useFollow } from '@/hooks/use-follow'
import { usePromptInteractions } from '@/hooks/use-prompt-interactions'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PromptGrid from '@/components/prompts/PromptGrid'
import { UserProfile } from '@/types'

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user } = useAuth()
  const { profile, prompts, loading, refreshProfile, setProfile } = useUserProfile(userId)
  const { toggleFollow, loading: followLoading } = useFollow()
  const { likedPromptIds, savedPromptIds, toggleLike, toggleSave } = usePromptInteractions(user?.id)
  
  const [showFollowersDialog, setShowFollowersDialog] = useState(false)
  const [showFollowingDialog, setShowFollowingDialog] = useState(false)
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [following, setFollowing] = useState<UserProfile[]>([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)

  const isOwnProfile = user?.id === userId

  const handleFollowToggle = async () => {
    if (!profile) return
    const wasFollowing = profile.isFollowing || false
    const success = await toggleFollow(userId, wasFollowing, refreshProfile)
    
    if (success && profile) {
      // Update the profile state immediately
      setProfile({
        ...profile,
        isFollowing: !wasFollowing,
        followers: (profile.followers || 0) + (wasFollowing ? -1 : 1)
      })
    }
  }

  const fetchFollowers = async () => {
    setLoadingFollowers(true)
    try {
      const response = await fetch(`/api/user/${userId}/followers`)
      if (response.ok) {
        const data = await response.json()
        setFollowers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch followers:', error)
    } finally {
      setLoadingFollowers(false)
    }
  }

  const fetchFollowing = async () => {
    setLoadingFollowers(true)
    try {
      const response = await fetch(`/api/user/${userId}/following`)
      if (response.ok) {
        const data = await response.json()
        setFollowing(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch following:', error)
    } finally {
      setLoadingFollowers(false)
    }
  }

  const handleShowFollowers = () => {
    setShowFollowersDialog(true)
    fetchFollowers()
  }

  const handleShowFollowing = () => {
    setShowFollowingDialog(true)
    fetchFollowing()
  }

  const handleViewDetails = (promptId: string) => {
    // Navigate to prompt details or open modal
    console.log('View prompt:', promptId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <UserCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                User Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The user you're looking for doesn't exist.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-green-100 text-green-600 text-3xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {profile.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.email}</p>
                  </div>

                  {!isOwnProfile && user && (
                    <Button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={
                        profile.isFollowing
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }
                    >
                      {profile.isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-6 mt-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile.promptsCount}
                    </span>
                    <span>Prompts</span>
                  </div>
                  <button
                    onClick={handleShowFollowers}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile.followers || 0}
                    </span>
                    <span>Followers</span>
                  </button>
                  <button
                    onClick={handleShowFollowing}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile.following || 0}
                    </span>
                    <span>Following</span>
                  </button>
                  {profile.createdAt && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="prompts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-6">
            {prompts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Prompts Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile
                      ? "You haven't created any prompts yet."
                      : "This user hasn't created any prompts yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <PromptGrid
                prompts={prompts}
                loading={false}
                currentUserId={user?.id}
                likedPromptIds={likedPromptIds}
                savedPromptIds={savedPromptIds}
                onLike={toggleLike}
                onSave={toggleSave}
                onViewDetails={handleViewDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Liked Prompts
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This feature is coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Followers Dialog */}
      <Dialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
        <DialogContent className="max-w-md max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loadingFollowers ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No followers yet</p>
              </div>
            ) : (
              followers.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/user/${follower.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowFollowersDialog(false)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {follower.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{follower.name}</p>
                    <p className="text-sm text-gray-500">{follower.email}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog}>
        <DialogContent className="max-w-md max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loadingFollowers ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : following.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Not following anyone yet</p>
              </div>
            ) : (
              following.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowFollowingDialog(false)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
