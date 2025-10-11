// Hook for managing comment modal state
import { useState, useCallback } from 'react'
import { Prompt } from '@/types'

interface UseCommentModalReturn {
  isOpen: boolean
  selectedPrompt: Prompt | null
  openCommentModal: (prompt: Prompt) => void
  closeCommentModal: () => void
}

export function useCommentModal(): UseCommentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

  const openCommentModal = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setIsOpen(true)
  }, [])

  const closeCommentModal = useCallback(() => {
    setIsOpen(false)
    // Delay clearing the prompt to allow for exit animation
    setTimeout(() => {
      setSelectedPrompt(null)
    }, 150)
  }, [])

  return {
    isOpen,
    selectedPrompt,
    openCommentModal,
    closeCommentModal,
  }
}
