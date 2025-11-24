"use client"

import { useState, useEffect } from "react"
import { Prompt } from "@/types"
import { launchExternalAgent } from "@/lib/launch-agent"
import { useAuth } from "@/hooks/use-auth"
import { usePrompts } from "@/hooks/use-prompts"
import { usePromptFilters } from "@/hooks/use-prompt-filters"
import { usePromptInteractions } from "@/hooks/use-prompt-interactions"
import { useOpenSharedDialog } from "@/hooks/useOpenSharedDialog"
import { useCommentModal } from "@/hooks/use-comment-modal"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import PromptSidebar from "@/components/PromptSidebar"
import PromptDetailModal from "@/components/PromptDetailModal"
import AIAgentCollections from "@/components/AIAgentCollections"
import PromptHeader from "@/components/prompts/PromptHeader"
import PromptFilters from "@/components/prompts/PromptFilters"
import PromptGrid from "@/components/prompts/PromptGrid"
import CommentModal from "@/components/comments/CommentModal"

export default function HomePage() {
  const { user } = useAuth()
  const { prompts, loading, setPrompts } = usePrompts()
  const { likedPromptIds, savedPromptIds, toggleLike, toggleSave } = usePromptInteractions(user?.id)
  const { isOpen: isCommentModalOpen, selectedPrompt: commentPrompt, openCommentModal, closeCommentModal } = useCommentModal()
  
  const [selectedAgentForFilter, setSelectedAgentForFilter] = useState<string>("all")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")
  const [selectedPromptForModal, setSelectedPromptForModal] = useState<Prompt | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [tempSelectedPromptId, setTempSelectedPromptId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showAIAgentCollections, setShowAIAgentCollections] = useState(false)
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  // Use the filter hook with additional filters
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedAgent,
    setSelectedAgent,
    filteredPrompts: baseFilteredPrompts,
  } = usePromptFilters(prompts)

  // Clear dev filters when switching away from Development category
  useEffect(() => {
    if (selectedCategory !== "Development") {
      setSelectedTechnologies([])
      setSelectedTools([])
    }
  }, [selectedCategory])

  // Apply additional filters
  const filteredPrompts = baseFilteredPrompts.filter((prompt) => {
    if (selectedAgentForFilter && selectedAgentForFilter !== "all") {
      if (!prompt.aiAgents.includes(selectedAgentForFilter)) return false
    }
    if (selectedCategoryFilter && prompt.category !== selectedCategoryFilter) {
      return false
    }
    
    // Development-specific filters
    if (selectedCategory === "Development" || selectedCategoryFilter === "Development") {
      // Filter by technologies
      if (selectedTechnologies.length > 0) {
        const hasMatchingTech = selectedTechnologies.some((tech) =>
          prompt.technologies?.includes(tech)
        )
        if (!hasMatchingTech) return false
      }
      
      // Filter by tools
      if (selectedTools.length > 0) {
        const hasMatchingTool = selectedTools.some((tool) =>
          prompt.tools?.includes(tool)
        )
        if (!hasMatchingTool) return false
      }
    }
    
    return true
  })

  // Share functionality
  const getPromptById = (id: string) => prompts.find(prompt => prompt._id === id)
  const { sharedPrompt, closeDialog } = useOpenSharedDialog(getPromptById)

  // Handle shared prompts
  useEffect(() => {
    if (sharedPrompt) {
      setSelectedPromptForModal(sharedPrompt)
    }
  }, [sharedPrompt])

  const handleViewDetails = (promptId: string) => {
    const prompt = prompts.find((p) => p._id === promptId)
    if (prompt) {
      setSelectedPromptForModal(prompt)
    }
  }

  const handleOpenComments = (promptId: string) => {
    const prompt = prompts.find((p) => p._id === promptId)
    if (prompt) {
      openCommentModal(prompt)
    }
  }

  const handleOpenChat = (agent: string, prompt: string) => {
    launchExternalAgent(agent, prompt)
    setSelectedPromptForModal(null)
  }

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId)
    setTempSelectedPromptId(promptId)

    const promptElement = document.getElementById(`prompt-${promptId}`)
    if (promptElement) {
      promptElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    setTimeout(() => {
      setTempSelectedPromptId(null)
      setSelectedPromptId(null)
    }, 2000)
  }

  const handlePromptRated = (promptId: string, newRating: number) => {
    // Update the prompt in the main prompts array
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt => 
        prompt._id === promptId 
          ? { ...prompt, rating: newRating }
          : prompt
      )
    )
    
    // Update the modal if it's open for this prompt
    if (selectedPromptForModal && selectedPromptForModal._id === promptId) {
      setSelectedPromptForModal({ ...selectedPromptForModal, rating: newRating } as Prompt)
    }
  }

  // Enhanced like handler that updates prompts array
  const handleLike = async (promptId: string) => {
    const wasLiked = likedPromptIds.has(promptId)
    
    // Optimistically update the prompts array
    setPrompts(prevPrompts => 
      prevPrompts.map(prompt => 
        prompt._id === promptId 
          ? { ...prompt, likes: wasLiked ? prompt.likes - 1 : prompt.likes + 1 }
          : prompt
      )
    )
    
    // Call the original toggle like
    const success = await toggleLike(promptId)
    
    // Revert if failed
    if (!success) {
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt => 
          prompt._id === promptId 
            ? { ...prompt, likes: wasLiked ? prompt.likes + 1 : prompt.likes - 1 }
            : prompt
        )
      )
    }
  }

  const handleCloseSharedDialog = () => {
    closeDialog()
    setSelectedPromptForModal(null)
  }

  const scrollToPrompts = () => {
    setTimeout(() => {
      const promptsSection = document.getElementById('prompts-section')
      if (promptsSection) {
        promptsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleAgentSelect = (agent: string) => {
    setSelectedAgentForFilter(agent)
    setTimeout(() => {
      scrollToPrompts()
    }, 150)
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
              selectedPromptId={selectedPromptId ?? undefined}
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
          <PromptHeader
            showAIAgentCollections={showAIAgentCollections}
            onToggleAIAgentCollections={() => setShowAIAgentCollections((prev) => !prev)}
          />

          {showAIAgentCollections && (
            <div className="mb-6 sm:mb-8">
              <AIAgentCollections onAgentSelect={handleAgentSelect} selectedAgent={selectedAgentForFilter} />
            </div>
          )}

          <PromptFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedAgent={selectedAgentForFilter}
            selectedTechnologies={selectedTechnologies}
            selectedTools={selectedTools}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onAgentChange={setSelectedAgentForFilter}
            onTechnologiesChange={setSelectedTechnologies}
            onToolsChange={setSelectedTools}
          />

          <div id="prompts-section">
            <PromptGrid
              prompts={filteredPrompts}
              loading={loading}
              currentUserId={user?.id}
              likedPromptIds={likedPromptIds}
              savedPromptIds={savedPromptIds}
              selectedPromptId={selectedPromptId}
              tempSelectedPromptId={tempSelectedPromptId}
              onLike={handleLike}
              onSave={toggleSave}
              onViewDetails={handleViewDetails}
              onComment={handleOpenComments}
            />
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

      <CommentModal
        prompt={commentPrompt}
        isOpen={isCommentModalOpen}
        onClose={closeCommentModal}
        currentUserId={user?.id}
      />

      <Footer />
    </div>
  )
}
