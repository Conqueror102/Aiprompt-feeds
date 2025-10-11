"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserIcon, Calendar, Bookmark, Edit, X, Users, MessageSquare, Heart, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PromptCard from "@/components/PromptCard"
import Navbar from "@/components/Navbar"
import { toast } from "@/hooks/use-toast"
import SimpleBadgeDisplay from "@/components/badges/SimpleBadgeDisplay"
import BadgedAvatar from "@/components/badges/BadgedAvatar"
import { useBadges } from "@/hooks/use-badges"
import { useHighestTier } from "@/hooks/use-highest-tier"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  followers?: number
  following?: number
  bio?: string
  avatar?: string
}

interface Prompt {
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
  createdAt: string
}

interface Follower {
  _id: string
  name: string
  email: string
  avatar?: string
  bio?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([])
  const [followers, setFollowers] = useState<Follower[]>([])
  const [following, setFollowing] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("posted")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })
  const [updating, setUpdating] = useState(false)
  const [commentActivity, setCommentActivity] = useState<any | null>(null)
  
  const { badges, loading: badgesLoading, earnedCount, totalCount } = useBadges({
    userId: user?.id,
    autoCheck: false
  })
  const highestTier = useHighestTier(badges)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      // Fetch user info
      const userResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!userResponse.ok) {
        router.push("/login")
        return
      }

      const userData = await userResponse.json()
      setUser(userData)
      setEditForm({
        name: userData.name,
        email: userData.email,
      })

      // Fetch user's prompts
      const promptsResponse = await fetch("/api/user/prompts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json()
        setUserPrompts(promptsData.prompts)
      }

      // Fetch saved prompts
      const savedResponse = await fetch("/api/user/saved-prompts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (savedResponse.ok) {
        const savedData = await savedResponse.json()
        setSavedPrompts(savedData.prompts)
      }

      // Fetch followers
      const followersResponse = await fetch(`/api/user/${userData.id}/followers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (followersResponse.ok) {
        const followersData = await followersResponse.json()
        setFollowers(followersData.users)
      }

      // Fetch following
      const followingResponse = await fetch(`/api/user/${userData.id}/following`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (followingResponse.ok) {
        const followingData = await followingResponse.json()
        setFollowing(followingData.users)
      }

      // Fetch comment activity
      const activityResponse = await fetch(`/api/user/comments/activity?userId=${userData.id}`)
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        if (activityData.success) setCommentActivity(activityData.data)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    setShowEditModal(true)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setShowEditModal(false)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalLikes = userPrompts.reduce((sum, prompt) => sum + prompt.likes, 0)
  const totalSaves = userPrompts.reduce((sum, prompt) => sum + prompt.saves, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <BadgedAvatar 
                userName={user.name}
                highestTier={highestTier}
                size="xl"
                showBadge={true}
              />

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      {user.role === "admin" && (
                        <Badge variant="secondary" className="ml-2">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" className="self-start bg-transparent" onClick={handleEditProfile}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{userPrompts.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Prompts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{savedPrompts.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.followers || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.following || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 max-w-4xl">
            <TabsTrigger value="posted" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Posted ({userPrompts.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved ({savedPrompts.length})
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Badges ({earnedCount})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posted" className="mt-6">
            {/* Comment Activity */}
            {commentActivity && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Total Comments</span>
                      </div>
                      <div className="text-2xl font-bold">{commentActivity.totalComments}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">Total Likes</span>
                      </div>
                      <div className="text-2xl font-bold">{commentActivity.totalLikes}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Top Commenters</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">See prompt pages for details</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {userPrompts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prompts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You haven't posted any prompts yet. Share your first prompt with the community!
                  </p>
                  <Button onClick={() => router.push("/add-prompt")} className="bg-green-600 hover:bg-green-700">
                    Create Your First Prompt
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPrompts.map((prompt) => (
                  <PromptCard key={prompt._id} prompt={prompt} currentUserId={user.id} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {savedPrompts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved prompts</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You haven't saved any prompts yet. Explore the community and save prompts you find useful!
                  </p>
                  <Button onClick={() => router.push("/")} variant="outline">
                    Explore Prompts
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt._id}
                    prompt={prompt}
                    currentUserId={user.id}
                    isSaved={true}
                    onSave={() => {
                      setSavedPrompts((prev) => prev.filter((p) => p._id !== prompt._id))
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            {badgesLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading badges...</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      Your Badges
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({earnedCount} earned)</span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Hover over badges to see details
                    </p>
                  </div>
                  <SimpleBadgeDisplay badges={badges} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            {followers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No followers yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Share your prompts to attract followers!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower) => (
                  <Card key={follower._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {follower.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {follower.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {follower.email}
                          </p>
                          {follower.bio && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                              {follower.bio}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full"
                            onClick={() => router.push(`/user/${follower._id}`)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            {following.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Not following anyone yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Discover and follow other creators in the community!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((user) => (
                  <Card key={user._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          {user.bio && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full"
                            onClick={() => router.push(`/user/${user._id}`)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={updating}>
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
