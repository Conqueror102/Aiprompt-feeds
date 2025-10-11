"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Clock, Heart, Users, Trophy, Award, Sparkles, Info, Target, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import PromptCard from "@/components/PromptCard"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import PromptDetailModal from "@/components/PromptDetailModal"
import BadgeCollection from "@/components/badges/BadgeCollection"
import { useBadges } from "@/hooks/use-badges"
import { ALL_BADGES } from "@/lib/badges/badge-definitions"
import { BadgeCategory } from "@/types/badge"

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
  rating?: number
}

interface User {
  id: string
  name: string
  email: string
  followers?: number
  following?: number
}

export default function ExplorePage() {
  const [user, setUser] = useState<User | null>(null)
  const [trendingPrompts, setTrendingPrompts] = useState<Prompt[]>([])
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([])
  const [popularPrompts, setPopularPrompts] = useState<Prompt[]>([])
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [totalPromptsOnPlatform, setTotalPromptsOnPlatform] = useState(0)
  
  const { badges, loading: badgesLoading, earnedCount, totalCount } = useBadges({
    userId: user?.id,
    autoCheck: false
  })

  const handlePromptRated = (promptId: string, newRating: number) => {
    setTrendingPrompts((prev) => prev.map((p) => p._id === promptId ? { ...p, rating: newRating } : p))
    setPopularPrompts((prev) => prev.map((p) => p._id === promptId ? { ...p, rating: newRating } : p))
    setRecentPrompts((prev) => prev.map((p) => p._id === promptId ? { ...p, rating: newRating } : p))
    if (selectedPrompt && selectedPrompt._id === promptId) {
      setSelectedPrompt({ ...selectedPrompt, rating: newRating })
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchPrompts()
      fetchUserData()
    }
  }, [user])

  const fetchUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts")
      if (response.ok) {
        const data = await response.json()
        const prompts = data.prompts
        setTotalPromptsOnPlatform(prompts.length)

        // Sort prompts for different categories
        setRecentPrompts([...prompts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6))
        setPopularPrompts([...prompts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6))
        setTrendingPrompts([...prompts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6))
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async () => {
    const token = localStorage.getItem("token")
    if (!token || !user) return

    try {
      // Fetch user's prompts
      const promptsResponse = await fetch("/api/user/prompts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json()
        setUserPrompts(promptsData.prompts)
      }

      // Fetch saved prompts
      const savedResponse = await fetch("/api/user/saved-prompts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (savedResponse.ok) {
        const savedData = await savedResponse.json()
        setSavedPrompts(savedData.prompts)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user ? `Welcome back, ${user.name}!` : "Dashboard"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personalized dashboard with stats, badges, and platform insights
          </p>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Prompts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userPrompts.length}</div>
              <p className="text-xs text-muted-foreground">Total prompts created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userPrompts.reduce((sum, prompt) => sum + prompt.likes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Likes on your prompts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.followers || 0}</div>
              <p className="text-xs text-muted-foreground">People following you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Prompts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedPrompts.length}</div>
              <p className="text-xs text-muted-foreground">Prompts you saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{totalPromptsOnPlatform}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Prompts on Platform</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{earnedCount}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Badges Earned</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{user?.following || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About the Platform */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              About AI Prompt Hub
            </CardTitle>
            <CardDescription>
              Learn about our platform and how to make the most of your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="platform">
                <AccordionTrigger>What is AI Prompt Hub?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI Prompt Hub is a community-driven platform where users can create, share, and discover high-quality prompts for various AI agents. 
                    Whether you're working with ChatGPT, Claude, Gemini, or other AI tools, you'll find prompts for every use case - from development 
                    and marketing to creative writing and data analysis.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="features">
                <AccordionTrigger>Key Features</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li><strong>Create & Share:</strong> Contribute your own prompts and help the community</li>
                    <li><strong>Discover:</strong> Browse thousands of prompts across multiple categories</li>
                    <li><strong>Save & Organize:</strong> Bookmark your favorite prompts for easy access</li>
                    <li><strong>Engage:</strong> Like, comment, and rate prompts to help others find quality content</li>
                    <li><strong>Follow:</strong> Connect with other creators and stay updated with their work</li>
                    <li><strong>Earn Badges:</strong> Unlock achievements as you contribute and engage with the community</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="getting-started">
                <AccordionTrigger>Getting Started</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-gray-600 dark:text-gray-400">
                    <p><strong>1. Create Your First Prompt:</strong> Click "Add Prompt" to share your knowledge with the community.</p>
                    <p><strong>2. Explore & Save:</strong> Browse prompts by category or AI agent, and save the ones you find useful.</p>
                    <p><strong>3. Engage:</strong> Like prompts you find helpful, leave comments, and rate them to help others.</p>
                    <p><strong>4. Build Your Network:</strong> Follow creators whose prompts you enjoy to stay updated.</p>
                    <p><strong>5. Earn Badges:</strong> Complete achievements to unlock badges and showcase your expertise.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Badge System Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Badge System & Achievements
            </CardTitle>
            <CardDescription>
              Earn badges by contributing to the community and achieving milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="understanding-badges">
                <AccordionTrigger>Understanding the Badge System</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Badges are achievements you earn by actively participating in the AI Prompt Hub community. Each badge has two key attributes:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Badge Categories (What You Do)
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          The <strong>type of activity</strong> the badge rewards. There are 5 categories: Content Creation, Engagement, Social, Time-Based, and Specialty.
                        </p>
                      </div>
                      
                      <div className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Badge Tiers (How Hard to Earn)
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          The <strong>difficulty/rarity level</strong> of the badge. There are 5 tiers: Common, Uncommon, Rare, Epic, and Legendary.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Example:</strong> The "Prolific Creator" badge is a <strong>Content Creation</strong> (category) badge that can be <strong>Uncommon, Rare, or Epic</strong> (tier) depending on how many prompts you've created.
                      </p>
                    </div>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">Badge Tiers (Click to see badges in each tier):</h4>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                      <AccordionItem value="common" className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🌱</span>
                            <div className="text-left">
                              <div className="font-semibold text-gray-700 dark:text-gray-200">Common</div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Easy to earn, great for beginners</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🌱</span>
                              <div>
                                <strong>First Steps</strong> - Create your first prompt
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📝</span>
                              <div>
                                <strong>Bronze Creator</strong> - Create 10 prompts
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>❤️</span>
                              <div>
                                <strong>Liked</strong> - Receive 100 total likes
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🔖</span>
                              <div>
                                <strong>Saved</strong> - Get 50 total saves
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📅</span>
                              <div>
                                <strong>Week Warrior</strong> - Create prompts for 7 consecutive days
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="uncommon" className="border border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🌿</span>
                            <div className="text-left">
                              <div className="font-semibold text-green-700 dark:text-green-200">Uncommon</div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Requires consistent participation</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📝</span>
                              <div>
                                <strong>Silver Creator</strong> - Create 50 prompts
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>❤️</span>
                              <div>
                                <strong>Well-Liked</strong> - Receive 500 total likes
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🔖</span>
                              <div>
                                <strong>Bookmarked</strong> - Get 200 total saves
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>👑</span>
                              <div>
                                <strong>Rising Star</strong> - Gain 50 followers
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🤝</span>
                              <div>
                                <strong>Networker</strong> - Follow 50+ users
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🎖️</span>
                              <div>
                                <strong>Established</strong> - 6 months membership
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📅</span>
                              <div>
                                <strong>Month Master</strong> - 30 consecutive days
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="rare" className="border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💎</span>
                            <div className="text-left">
                              <div className="font-semibold text-blue-700 dark:text-blue-200">Rare</div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Significant achievements</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📝</span>
                              <div>
                                <strong>Gold Creator</strong> - Create 100 prompts
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🤖</span>
                              <div>
                                <strong>Multi-Agent Master</strong> - Create prompts for 5+ different AI agents
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🗺️</span>
                              <div>
                                <strong>Category Explorer</strong> - Create prompts in 5+ different categories
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>❤️</span>
                              <div>
                                <strong>Beloved</strong> - Receive 1,000 total likes
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🔖</span>
                              <div>
                                <strong>Treasured</strong> - Get 500 total saves
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🚀</span>
                              <div>
                                <strong>Viral Hit</strong> - Single prompt with 100+ likes
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>👑</span>
                              <div>
                                <strong>Influencer</strong> - Gain 100 followers
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🎖️</span>
                              <div>
                                <strong>Veteran</strong> - 1 year membership
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📅</span>
                              <div>
                                <strong>Quarter Champion</strong> - 90 consecutive days
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="epic" className="border border-purple-200 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⚡</span>
                            <div className="text-left">
                              <div className="font-semibold text-purple-700 dark:text-purple-200">Epic</div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Exceptional contributions</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📝</span>
                              <div>
                                <strong>Platinum Creator</strong> - Create 500 prompts
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>⭐</span>
                              <div>
                                <strong>Quality Craftsman</strong> - Maintain 4.5+ star average on 10+ prompts
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>❤️</span>
                              <div>
                                <strong>Adored</strong> - Receive 5,000 total likes
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🔖</span>
                              <div>
                                <strong>Essential</strong> - Get 1,000 total saves
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>👑</span>
                              <div>
                                <strong>Celebrity</strong> - Gain 500 followers
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🏗️</span>
                              <div>
                                <strong>Community Builder</strong> - 100+ followers AND follow 50+ users
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🎖️</span>
                              <div>
                                <strong>Elder</strong> - 2 years membership
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="legendary" className="border border-yellow-200 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👑</span>
                            <div className="text-left">
                              <div className="font-semibold text-yellow-700 dark:text-yellow-200">Legendary</div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Reserved for the most dedicated community members</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>🏴‍☠️</span>
                              <div>
                                <strong>Pioneer</strong> - Among the first 100 users
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>👑</span>
                              <div>
                                <strong>Legend</strong> - Gain 1,000 followers
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                              <span>📅</span>
                              <div>
                                <strong>Year Legend</strong> - 365 consecutive days
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="badge-categories">
                <AccordionTrigger>Badge Categories with Specific Requirements</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Content Creation */}
                    <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex items-center gap-2 font-semibold mb-3 text-blue-900 dark:text-blue-200">
                        <Award className="h-5 w-5" />
                        Content Creation Badges
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🌱</span>
                          <div>
                            <strong>First Steps</strong> - Create your first prompt
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">📝</span>
                          <div>
                            <strong>Prolific Creator (Progressive)</strong>
                            <ul className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Bronze Creator: 10 prompts</li>
                              <li>• Silver Creator: 50 prompts</li>
                              <li>• Gold Creator: 100 prompts</li>
                              <li>• Platinum Creator: 500 prompts</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🤖</span>
                          <div>
                            <strong>Multi-Agent Master</strong> - Create prompts for 5+ different AI agents
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🗺️</span>
                          <div>
                            <strong>Category Explorer</strong> - Create prompts in 5+ different categories
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">⭐</span>
                          <div>
                            <strong>Quality Craftsman</strong> - Maintain 4.5+ star average rating across 10+ rated prompts
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Engagement */}
                    <div className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                      <div className="flex items-center gap-2 font-semibold mb-3 text-purple-900 dark:text-purple-200">
                        <Sparkles className="h-5 w-5" />
                        Engagement Badges
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">❤️</span>
                          <div>
                            <strong>Popular Creator (Progressive)</strong>
                            <ul className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Liked: 100 total likes</li>
                              <li>• Well-Liked: 500 total likes</li>
                              <li>• Beloved: 1,000 total likes</li>
                              <li>• Adored: 5,000 total likes</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🔖</span>
                          <div>
                            <strong>Bookmarked (Progressive)</strong>
                            <ul className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Saved: 50 total saves</li>
                              <li>• Bookmarked: 200 total saves</li>
                              <li>• Treasured: 500 total saves</li>
                              <li>• Essential: 1,000 total saves</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🚀</span>
                          <div>
                            <strong>Viral Hit</strong> - Create a single prompt with 100+ likes
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social */}
                    <div className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                      <div className="flex items-center gap-2 font-semibold mb-3 text-green-900 dark:text-green-200">
                        <Users className="h-5 w-5" />
                        Social Badges
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">👑</span>
                          <div>
                            <strong>Influencer (Progressive)</strong>
                            <ul className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Rising Star: 50 followers</li>
                              <li>• Influencer: 100 followers</li>
                              <li>• Celebrity: 500 followers</li>
                              <li>• Legend: 1,000 followers</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🤝</span>
                          <div>
                            <strong>Networker</strong> - Follow 50+ users
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🏗️</span>
                          <div>
                            <strong>Community Builder</strong> - Have 100+ followers AND follow 50+ users
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time-Based */}
                    <div className="p-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
                      <div className="flex items-center gap-2 font-semibold mb-3 text-orange-900 dark:text-orange-200">
                        <Clock className="h-5 w-5" />
                        Time-Based Badges
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🏴‍☠️</span>
                          <div>
                            <strong>Pioneer</strong> - Be among the first 100 users (Legendary!)
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🎖️</span>
                          <div>
                            <strong>Veteran (Progressive)</strong>
                            <ul className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Established: 6 months membership</li>
                              <li>• Veteran: 1 year membership</li>
                              <li>• Elder: 2 years membership</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">📅</span>
                          <div>
                            <strong>Consistent Contributor (Progressive)</strong>
                            <ul className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Week Warrior: 7 consecutive days</li>
                              <li>• Month Master: 30 consecutive days</li>
                              <li>• Quarter Champion: 90 consecutive days</li>
                              <li>• Year Legend: 365 consecutive days</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Specialty */}
                    <div className="p-4 border-2 border-pink-200 dark:border-pink-800 rounded-lg bg-pink-50/50 dark:bg-pink-900/10">
                      <div className="flex items-center gap-2 font-semibold mb-3 text-pink-900 dark:text-pink-200">
                        <Target className="h-5 w-5" />
                        Specialty Badges
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🤖</span>
                          <div>
                            <strong>AI Agent Specialists</strong> - Create 50+ prompts for a specific AI agent
                            <ul className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• ChatGPT Master, Claude Expert, Gemini Guru, etc.</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🎨</span>
                          <div>
                            <strong>Image Wizard</strong> - Create 20+ image generation prompts
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">💻</span>
                          <div>
                            <strong>Code Whisperer</strong> - Create 20+ development/coding prompts
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🎬</span>
                          <div>
                            <strong>Video Creator</strong> - Create 20+ video creation prompts
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-earn">
                <AccordionTrigger>How to Earn Badges</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-gray-600 dark:text-gray-400">
                    <div>
                      <strong className="text-gray-900 dark:text-white">📝 Create Quality Prompts:</strong>
                      <p className="text-sm mt-1">Share well-crafted prompts across different categories and AI agents. Maintain high ratings to earn quality badges.</p>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-white">❤️ Engage with Content:</strong>
                      <p className="text-sm mt-1">Like, save, and comment on prompts. Help others by leaving helpful feedback and starting discussions.</p>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-white">👥 Build Your Network:</strong>
                      <p className="text-sm mt-1">Follow creators you admire and gain followers by creating valuable content.</p>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-white">🎯 Specialize:</strong>
                      <p className="text-sm mt-1">Focus on specific AI agents or categories to become a recognized expert.</p>
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-white">⏰ Stay Consistent:</strong>
                      <p className="text-sm mt-1">Regular contributions and long-term membership earn time-based badges.</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mt-4">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-200">💡 Tip: Badges are checked automatically after key actions like creating prompts, receiving likes, or gaining followers!</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* User's Earned Badges */}
        {!badgesLoading && badges.length > 0 && (
          <div className="mb-8">
            <BadgeCollection 
              badges={badges} 
              showProgress={true}
              title="Your Badge Collection"
            />
          </div>
        )}

        {/* Prompt Collections */}
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending">🔥 Trending</TabsTrigger>
            <TabsTrigger value="popular">⭐ Popular</TabsTrigger>
            <TabsTrigger value="recent">🆕 Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPrompts.map((prompt) => (
                <PromptCard key={prompt._id} prompt={prompt} currentUserId={user?.id} onViewDetails={() => setSelectedPrompt(prompt)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularPrompts.map((prompt) => (
                <PromptCard key={prompt._id} prompt={prompt} currentUserId={user?.id} onViewDetails={() => setSelectedPrompt(prompt)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPrompts.map((prompt) => (
                <PromptCard key={prompt._id} prompt={prompt} currentUserId={user?.id} onViewDetails={() => setSelectedPrompt(prompt)} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          isOpen={!!selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          currentUserId={user?.id}
          onOpenChat={() => {}}
          onRated={handlePromptRated}
        />
      )}

      <Footer />
    </div>
  )
}
