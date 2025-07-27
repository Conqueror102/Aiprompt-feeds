"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PromptCard from "@/components/PromptCard"
import Navbar from "@/components/Navbar"
import { AI_AGENTS, CATEGORIES } from "@/lib/constants"

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

interface User {
  id: string
  name: string
  email: string
}

export default function SavedPromptsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedAgent, setSelectedAgent] = useState<string>("all")

  useEffect(() => {
    fetchUserAndPrompts()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [savedPrompts, searchTerm, selectedCategory, selectedAgent])

  const fetchUserAndPrompts = async () => {
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
    } catch (error) {
      console.error("Failed to fetch data:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const filterPrompts = () => {
    let filtered = savedPrompts

    if (searchTerm) {
      filtered = filtered.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((prompt) => prompt.category === selectedCategory)
    }

    if (selectedAgent !== "all") {
      filtered = filtered.filter((prompt) => prompt.aiAgents.includes(selectedAgent))
    }

    setFilteredPrompts(filtered)
  }

  const handleUnsave = (promptId: string) => {
    setSavedPrompts((prev) => prev.filter((prompt) => prompt._id !== promptId))
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-green-600" />
            Saved Prompts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your collection of saved prompts ({savedPrompts.length} total)
          </p>
        </div>

        {savedPrompts.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search saved prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="AI Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {AI_AGENTS.map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {savedPrompts.length === 0 ? "No saved prompts yet" : "No prompts match your filters"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {savedPrompts.length === 0
                ? "Start exploring and save prompts you find useful!"
                : "Try adjusting your search or filters."}
            </p>
            {savedPrompts.length === 0 && (
              <button
                onClick={() => router.push("/")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Explore Prompts
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt._id}
                prompt={prompt}
                currentUserId={user?.id}
                isSaved={true}
                onSave={handleUnsave}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
