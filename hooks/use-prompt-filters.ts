// Custom hook for managing prompt filtering
import { useState, useMemo } from 'react'
import { Prompt, PromptFilters } from '@/types'
import { filterPrompts } from '@/utils/prompt-filters'

export function usePromptFilters(prompts: Prompt[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState('all')

  const filters: PromptFilters = {
    searchTerm,
    category: selectedCategory,
    agent: selectedAgent,
  }

  const filteredPrompts = useMemo(() => {
    return filterPrompts(prompts, filters)
  }, [prompts, searchTerm, selectedCategory, selectedAgent])

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedAgent('all')
  }

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedAgent,
    setSelectedAgent,
    filteredPrompts,
    resetFilters,
  }
}
