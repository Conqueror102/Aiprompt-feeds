"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PromptCard from "@/components/PromptCard"
import PromptCardSkeleton from "@/components/PromptCardSkeleton"
import PromptDetailModal from "@/components/PromptDetailModal"
import PromptSidebar from "@/components/PromptSidebar"
import AIAgentChat from "@/components/AIAgentChat"
import DevModeToggle from "@/components/DevModeToggle"
import DevModeInterface from "@/components/DevModeInterface"
import AIAgentCollections from "@/components/AIAgentCollections"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { useAuth } from "@/hooks/use-auth"
import { useOpenSharedDialog } from "@/hooks/useOpenSharedDialog"
import { AI_AGENTS, CATEGORIES } from "@/lib/constants"
import { Search } from "lucide-react"

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
  rating?: number
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAgent, setSelectedAgent] = useState("all")
  const [selectedAgentForFilter, setSelectedAgentForFilter] = useState<string>("all")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")
  const [selectedPromptForModal, setSelectedPromptForModal] = useState<Prompt | null>(null)
  const [chatAgent, setChatAgent] = useState<{ agent: string; prompt: string } | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [tempSelectedPromptId, setTempSelectedPromptId] = useState<string | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showAIAgentCollections, setShowAIAgentCollections] = useState(false)
  const [likedPromptIds, setLikedPromptIds] = useState<Set<string>>(new Set())
  const [savedPromptIds, setSavedPromptIds] = useState<Set<string>>(new Set())

  // Share functionality
  const getPromptById = (id: string) => prompts.find(prompt => prompt._id === id)
  const { sharedPrompt, closeDialog, loading: shareLoading } = useOpenSharedDialog(getPromptById)

  useEffect(() => {
    fetchPrompts()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserPrompts()
    } else {
      setLikedPromptIds(new Set())
      setSavedPromptIds(new Set())
    }
  }, [user])

  useEffect(() => {
    filterPrompts()
  }, [prompts, searchTerm, selectedCategory, selectedAgent, selectedAgentForFilter, selectedCategoryFilter])

  // Handle shared prompts
  useEffect(() => {
    if (sharedPrompt) {
      setSelectedPromptForModal(sharedPrompt)
    }
  }, [sharedPrompt])

  const fetchPrompts = async () => {
    // Check if we have cached data
    const cached = localStorage.getItem('cachedPrompts')
    const cacheTime = localStorage.getItem('cachedPromptsTime')
    
    // Check if cache is still fresh (5 minutes old)
    const isCacheFresh = cacheTime && (Date.now() - parseInt(cacheTime) < 5 * 60 * 1000)
    
    if (cached && isCacheFresh) {
      // Use cached data (instant loading)
      setPrompts(JSON.parse(cached))
      setLoading(false)
      return
    }

    // Cache is old or doesn't exist, fetch fresh data
    try {
      const response = await fetch("/api/prompts")
      if (response.ok) {
        const data = await response.json()
        setPrompts(data.prompts)
        
        // Save to cache for next time
        localStorage.setItem('cachedPrompts', JSON.stringify(data.prompts))
        localStorage.setItem('cachedPromptsTime', Date.now().toString())
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPrompts = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Fetch liked prompts
      const likedResponse = await fetch("/api/user/liked-prompts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (likedResponse.ok) {
        const likedData = await likedResponse.json()
        setLikedPromptIds(new Set(likedData.prompts.map((p: any) => p._id)))
      }

      // Fetch saved prompts
      const savedResponse = await fetch("/api/user/saved-prompts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (savedResponse.ok) {
        const savedData = await savedResponse.json()
        setSavedPromptIds(new Set(savedData.prompts.map((p: any) => p._id)))
      }
    } catch (error) {
      console.error("Failed to fetch user prompts:", error)
    }
  }

  const filterPrompts = () => {
    let filtered = prompts

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

    if (selectedAgentForFilter && selectedAgentForFilter !== "all") {
      filtered = filtered.filter((prompt) => prompt.aiAgents.includes(selectedAgentForFilter))
    }

    if (selectedCategoryFilter) {
      filtered = filtered.filter((prompt) => prompt.category === selectedCategoryFilter)
    }

    setFilteredPrompts(filtered)
  }

  const handleViewDetails = (promptId: string) => {
    const prompt = prompts.find((p) => p._id === promptId)
    if (prompt) {
      setSelectedPromptForModal(prompt)
    }
  }

  const handleOpenChat = (agent: string, prompt: string) => {
    setChatAgent({ agent, prompt })
    setSelectedPromptForModal(null)
  }

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
    setTempSelectedPromptId(promptId);

    // Scroll to the selected prompt card
    const promptElement = document.getElementById(`prompt-${promptId}`);
    if (promptElement) {
      promptElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Remove highlight after 2 seconds
    setTimeout(() => {
      setTempSelectedPromptId(null);
      setSelectedPromptId(null);
    }, 2000);
  };

  const handlePromptRated = (promptId: string, newRating: number) => {
    setPrompts((prev) => prev.map((p) => p._id === promptId ? { ...p, rating: newRating } : p))
    setFilteredPrompts((prev) => prev.map((p) => p._id === promptId ? { ...p, rating: newRating } : p))
    if (selectedPromptForModal && selectedPromptForModal._id === promptId) {
      setSelectedPromptForModal({ ...selectedPromptForModal, rating: newRating } as Prompt)
    }
  }

  const handleCloseSharedDialog = () => {
    closeDialog()
    setSelectedPromptForModal(null)
  }

  const handleLikePrompt = (promptId: string) => {
    setLikedPromptIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(promptId)) {
        newSet.delete(promptId)
      } else {
        newSet.add(promptId)
      }
      return newSet
    })
  }

  const handleSavePrompt = (promptId: string) => {
    setSavedPromptIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(promptId)) {
        newSet.delete(promptId)
      } else {
        newSet.add(promptId)
      }
      return newSet
    })
  }

  // Clear cache when prompts are updated
  const clearPromptCache = () => {
    localStorage.removeItem('cachedPrompts')
    localStorage.removeItem('cachedPromptsTime')
  }

  // Scroll to prompts section
  const scrollToPrompts = () => {
    // Small delay to ensure AI Agent Collections is expanded
    setTimeout(() => {
      const promptsSection = document.getElementById('prompts-section')
      if (promptsSection) {
        promptsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Handle agent selection and scroll to prompts
  const handleAgentSelect = (agent: string) => {
    setSelectedAgentForFilter(agent)
    // Small delay to ensure filter is applied before scrolling
    setTimeout(() => {
      scrollToPrompts()
    }, 150)
  }

  if (isDevMode) {
    return <DevModeInterface prompts={prompts} currentUserId={user?.id || undefined} onDeactivate={() => setIsDevMode(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar 
        user={user} 
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex relative">
        {/* Sidebar */}
        <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="w-full sm:w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg">
            <PromptSidebar
              prompts={prompts}
              onPromptSelect={handlePromptSelect}
              onCategoryFilter={setSelectedCategoryFilter}
              selectedPromptId={selectedPromptId}
              tempSelectedPromptId={tempSelectedPromptId}
              selectedCategory={selectedCategoryFilter}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-8 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-80' : ''
        }`}>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Discover AI Prompts</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Browse and share the best prompts for AI agents</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  className="px-3 py-2 text-sm rounded-md border border-green-600 text-green-700 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                  onClick={() => setShowAIAgentCollections((prev) => !prev)}
                >
                  {showAIAgentCollections ? "Hide" : "Browse by AI Agent"}
                </button>
              </div>
            </div>
            
            {/* Dev Mode Toggle and Explore - Positioned on the right */}
            <div className="flex justify-end gap-2 mb-4">
              <Link href="/explore">
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span className="hidden sm:inline">Explore</span>
                </Button>
              </Link>
              <DevModeToggle isDevMode={isDevMode} onToggle={setIsDevMode} />
            </div>
          </div>

          {/* AI Agent Collections */}
          {showAIAgentCollections && (
            <div className="mb-6 sm:mb-8">
              <AIAgentCollections onAgentSelect={handleAgentSelect} selectedAgent={selectedAgentForFilter} />
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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

                <Select value={selectedAgentForFilter} onValueChange={setSelectedAgentForFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="AI Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All AI Agents</SelectItem>
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

          {/* Prompts Grid */}
          <div id="prompts-section">
            {loading ? (
              // Show skeleton loading while fetching prompts
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index}>
                    <PromptCardSkeleton />
                  </div>
                ))}
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                  {prompts.length === 0 ? "No prompts found. Be the first to add one!" : "No prompts match your filters."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredPrompts.map((prompt) => (
                  <div key={prompt._id} id={`prompt-${prompt._id}`}>
                    <PromptCard
                      prompt={prompt}
                      currentUserId={user?.id || undefined}
                      isLiked={likedPromptIds.has(prompt._id)}
                      isSaved={savedPromptIds.has(prompt._id)}
                      onLike={handleLikePrompt}
                      onSave={handleSavePrompt}
                      onViewDetails={handleViewDetails}
                      isSelected={selectedPromptId === prompt._id}
                      tempSelectedPromptId={tempSelectedPromptId}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <PromptDetailModal
        prompt={selectedPromptForModal}
        isOpen={!!selectedPromptForModal}
        onClose={sharedPrompt ? handleCloseSharedDialog : () => setSelectedPromptForModal(null)}
        currentUserId={user?.id || undefined}
        onOpenChat={handleOpenChat}
        onRated={handlePromptRated}
      />

      {chatAgent && (
        <AIAgentChat agentName={chatAgent.agent} initialPrompt={chatAgent.prompt} onClose={() => setChatAgent(null)} />
      )}

      <Footer />
    </div>
  )
}
