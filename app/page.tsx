"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PromptCard from "@/components/PromptCard"
import PromptDetailModal from "@/components/PromptDetailModal"
import PromptSidebar from "@/components/PromptSidebar"
import AIAgentChat from "@/components/AIAgentChat"
import DevModeToggle from "@/components/DevModeToggle"
import DevModeInterface from "@/components/DevModeInterface"
import AIAgentCollections from "@/components/AIAgentCollections"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { useAuth } from "@/hooks/use-auth"
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

  useEffect(() => {
    fetchPrompts()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [prompts, searchTerm, selectedCategory, selectedAgent, selectedAgentForFilter, selectedCategoryFilter])

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
              <AIAgentCollections onAgentSelect={setSelectedAgentForFilter} selectedAgent={selectedAgentForFilter} />
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
          {filteredPrompts.length === 0 ? (
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
