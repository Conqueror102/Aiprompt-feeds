"use client"

import { useState, useEffect } from "react"
import { Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PromptCard from "@/components/PromptCard"
import Navbar from "@/components/Navbar"
import { AI_AGENTS, CATEGORIES } from "@/lib/constants"
import Footer from "@/components/Footer"
import PromptDetailModal from "@/components/PromptDetailModal"
import AIAgentCollections from "@/components/AIAgentCollections"
import PromptSidebar from "@/components/PromptSidebar"
import DevModeToggle from "@/components/DevModeToggle"
import DevModeInterface from "@/components/DevModeInterface"
import AIAgentChat from "@/components/AIAgentChat"

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
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedAgent, setSelectedAgent] = useState<string>("all")

  const [selectedPromptForModal, setSelectedPromptForModal] = useState<Prompt | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [selectedAgentForFilter, setSelectedAgentForFilter] = useState<string>("")
  const [selectedPromptId, setSelectedPromptId] = useState<string>("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [chatAgent, setChatAgent] = useState<{ agent: string; prompt: string } | null>(null)
  const [showAIAgentCollections, setShowAIAgentCollections] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [tempSelectedPromptId, setTempSelectedPromptId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser()
    fetchPrompts()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [prompts, searchTerm, selectedCategory, selectedAgent, selectedAgentForFilter, selectedCategoryFilter])

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
      } else {
        // Token might be expired, remove it
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      localStorage.removeItem("token")
    }
  }

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts")
      if (response.ok) {
        const data = await response.json()
        setPrompts(data.prompts)
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error)
    } finally {
      setLoading(false)
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

    if (selectedAgentForFilter) {
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

  if (isDevMode) {
    return <DevModeInterface prompts={prompts} currentUserId={user?.id} onDeactivate={() => setIsDevMode(false)} />
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
          <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg">
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
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-80' : ''
        }`}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Discover AI Prompts</h1>
                <p className="text-gray-600 dark:text-gray-400">Browse and share the best prompts for AI agents</p>
              </div>
              <div className="flex items-center gap-2">
                <DevModeToggle isDevMode={isDevMode} onToggle={setIsDevMode} />
                <button
                  className="px-3 py-2 rounded-md border border-green-600 text-green-700 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
                  onClick={() => setShowAIAgentCollections((prev) => !prev)}
                >
                  {showAIAgentCollections ? "Hide" : "Browse by AI Agent"}
                </button>
              </div>
            </div>
          </div>

          {/* AI Agent Collections */}
          {showAIAgentCollections && (
            <div className="mb-8">
              <AIAgentCollections onAgentSelect={setSelectedAgentForFilter} selectedAgent={selectedAgentForFilter} />
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
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

          {/* Prompts Grid */}
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {prompts.length === 0 ? "No prompts found. Be the first to add one!" : "No prompts match your filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPrompts.map((prompt) => (
                <div key={prompt._id} id={`prompt-${prompt._id}`}>
                  <PromptCard
                    prompt={prompt}
                    currentUserId={user?.id}
                    onViewDetails={handleViewDetails}
                    isSelected={selectedPromptId === prompt._id}
                    tempSelectedPromptId={tempSelectedPromptId}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <PromptDetailModal
        prompt={selectedPromptForModal}
        isOpen={!!selectedPromptForModal}
        onClose={() => setSelectedPromptForModal(null)}
        currentUserId={user?.id}
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
