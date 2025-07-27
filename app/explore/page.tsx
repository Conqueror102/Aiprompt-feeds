"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Clock, Heart, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import PromptCard from "@/components/PromptCard"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AI_AGENTS, CATEGORIES } from "@/lib/constants"
import PromptDetailModal from "@/components/PromptDetailModal"

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
}

export default function ExplorePage() {
  const [user, setUser] = useState<User | null>(null)
  const [trendingPrompts, setTrendingPrompts] = useState<Prompt[]>([])
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([])
  const [popularPrompts, setPopularPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

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
    fetchPrompts()
  }, [])

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore AI Prompts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover trending prompts, popular categories, and the latest additions to our community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{AI_AGENTS.length}</div>
              <p className="text-xs text-muted-foreground">Supported platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{CATEGORIES.length}</div>
              <p className="text-xs text-muted-foreground">Different use cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentPrompts.length + popularPrompts.length}</div>
              <p className="text-xs text-muted-foreground">Community contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...recentPrompts, ...popularPrompts].reduce((sum, prompt) => sum + prompt.likes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Community engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-50 hover:border-green-200"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Agents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supported AI Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AI_AGENTS.map((agent) => (
                <Badge key={agent} variant="secondary" className="cursor-pointer hover:bg-green-100">
                  {agent}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

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
